const axios = require('axios');
const { validateProxyTarget } = require('../utils/ssrfGuard');

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
const MAX_RESPONSE_SIZE_BYTES = 5 * 1024 * 1024; //5MB

const proxyRequest = async(req, res) => {
    const { url, method = 'GET', headers = {}, body, timeout = 10000  } = req.body;

    if(!url){
        const err = new Error('URL is required.');  
        err.statusCode = 400;
        throw err;
    }

    const upperMethod = method.toUpperCase();
    if(!ALLOWED_METHODS.has(upperMethod)) {
        const err = new Error(`Method "${method}" is not allowed.`); 
        err.statusCode = 400;
        throw err;
    }

    // SSRF check - throws if URL is private. Returns the exact IP(s) we
    // just validated so the actual request can be pinned to them below.
    const { addresses } = await validateProxyTarget(url);

    // Pin DNS resolution to the address(es) we just validated. Without this,
    // axios/Node would re-resolve the hostname independently when making the
    // request — if the DNS record has a very short TTL, that second lookup
    // could return a different (private) IP than the one we just checked
    // (DNS-rebinding). Forcing the same resolved IP closes that gap.
    const pinnedLookup = (hostname, options, callback) => {
        const chosen = addresses[0];
        if (options?.all) {
            return callback(null, addresses.map(a => ({ address: a.address, family: a.family })));
        }
        callback(null, chosen.address, chosen.family);
    };

    //Strip hop-by-hop headers that shouldn't be forwaded
    const safeHeaders = { ...headers };
    ['host', 'connection', 'transfer-encoding', 'upgrade'].forEach(h => delete safeHeaders[h]);

    // add a User-Agent to identify the proxy 
    safeHeaders['User-Agent'] = 'DevToolBox-Proxy/1.0';

    const startTime = Date.now();

    try {
        const response = await axios({
            url,
            method : upperMethod,
            headers : safeHeaders,
            data : ['GET', 'HEAD'].includes(upperMethod) ? undefined : body,
            timeout,
            maxRedirects : 0, // SSRF fix: don't follow redirects — a public URL could 302 to a private IP, bypassing validateProxyTarget
            maxContentLength : MAX_RESPONSE_SIZE_BYTES,
            validateStatus : () => true,  // Don't throw on 4xx/5xx - return them to user
            responseType : 'text',
            lookup : pinnedLookup, // SSRF fix: pin DNS to the pre-validated IP (prevents DNS-rebinding TOCTOU)
        });
        
        const duration = Date.now() - startTime;
        
        // Attempt to parse as JSON for the response 
        let responseData = response.data;
        let responseJson = null;
        try {
            responseJson = JSON.parse(responseData);
            responseData = responseJson;
        }
        catch {
            // Not JSON - send as text 
        }

        res.json({
            success : true,
            status : response.status,
            statusText : response.statusText,
            headers : response.headers,
            data : responseData,
            duration,
            size : Buffer.byteLength(JSON.stringify(responseData), 'utf8'),
        });
    }
    catch(axiosError){
        if(axiosError.code === 'ECONNABORTED') {
            const err = new Error(`Request timed out after ${timeout}ms`);
            err.statusCode = 408; 
            throw err;
        } 

        throw axiosError;
    }
};

module.exports = { proxyRequest };
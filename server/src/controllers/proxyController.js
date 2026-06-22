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

    // SSRF check - throws if URL is private 
    await validateProxyTarget(url);

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
            maxContentLength : MAX_RESPONSE_SIZE_BYTES,
            validateStatus : () => true,  // Don't throw on 4xx/5xx - return them to user
            responseType : 'text', 
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
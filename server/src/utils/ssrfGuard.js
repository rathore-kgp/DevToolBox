const dns = require('dns').promises;
const { isIP } = require('net');

const BLOCKED_HOSTS = new Set([
    'localhost', '0.0.0.0',
]);

const BLOCKED_CIDRS = [
  // Private IPv4 ranges (RFC 1918)
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  // Loopback
  /^127\./,
  // Link-local (AWS metadata service)
  /^169\.254\./,
  // IPv6 loopback and private
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

const isPrivateIP = (ip) => {
    return BLOCKED_CIDRS.some(pattern => pattern.test(ip));
}

const validateProxyTarget = async (url) => {
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new Error('Invalid URL format.');
    }

    //Block non-HTTP protocols
    if(!['http:', 'https:'].includes(parsed.protocol)){
        throw new Error(`Protocol "${parsed.protocol}" is not allowed. Only HTTP and HTTPS are permitted.`);
    }

    const hostname = parsed.hostname;

    //Block directly named private hosts
    if(BLOCKED_HOSTS.has(hostname.toLowerCase())) {
        throw new Error(`Requests to "${hostname}" are not allowed.`);
    }

    //If the hostname IS an IP, check immediately
    if(isIP(hostname)){
        if(isPrivateIP(hostname)) {
            throw new Error('Requests to private IP addresses are not allowed.');
        }
        // Pin: the request must connect to this exact IP, nothing else to resolve.
        return { hostname, addresses: [{ address: hostname, family: isIP(hostname) }] };
    }

    //DNS resolve and check resulting IP
    let addresses;
    try{
        addresses = await dns.lookup(hostname, { all : true });
    }
    catch {
        throw new Error(`Could not resolve hostname: ${hostname}`);
    }

    if (addresses.length === 0) {
        throw new Error(`Could not resolve hostname: ${hostname}`);
    }

    for(const { address } of addresses) {
        if(isPrivateIP(address)) {
            throw new Error(`Domain "${hostname}" resolves to a private IP address.`);
        }
    }

    // Return the exact addresses we just validated. The caller pins the
    // outgoing request to these IPs (via a custom DNS lookup) so a second,
    // independent resolution at request time can't be rebound to a private
    // IP in the window between this check and the actual request
    // (DNS-rebinding / TOCTOU).
    return { hostname, addresses };
};

module.exports = { validateProxyTarget };
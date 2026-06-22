import { parseCurl } from './curlParser';

const generateAxiosCode = (parsed) => {
  const { url, method, headers, body, auth } = parsed;

  let bodyParsed = null;
  if (body) {
    try {
      bodyParsed = JSON.parse(body);
    } catch {
      bodyParsed = body; // Keep as string if not JSON
    }
  }

  const headersStr = Object.keys(headers).length > 0
    ? `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},\n`
    : '';

  const dataStr = bodyParsed !== null
    ? `  data: ${JSON.stringify(bodyParsed, null, 4).replace(/\n/g, '\n  ')},\n`
    : '';

  const authStr = auth
    ? `  auth: { username: '${auth.username}', password: '${auth.password}' },\n`
    : '';

  return `import axios from 'axios';

const response = await axios({
  method: '${method.toLowerCase()}',
  url: '${url}',
${headersStr}${dataStr}${authStr}});

console.log(response.data);`;
};

const generateFetchCode = (parsed) => {
  const { url, method, headers, body, auth } = parsed;

  const allHeaders = { ...headers };
  if (auth) {
    const encoded = btoa(`${auth.username}:${auth.password}`);
    allHeaders['Authorization'] = `Basic ${encoded}`;
  }

  const headersStr = Object.keys(allHeaders).length > 0
    ? `  headers: ${JSON.stringify(allHeaders, null, 4).replace(/\n/g, '\n  ')},\n`
    : '';

  const bodyStr = body
    ? `  body: ${JSON.stringify(body)},\n`
    : '';

  return `const response = await fetch('${url}', {
  method: '${method}',
${headersStr}${bodyStr}});

const data = await response.json();
console.log(data);`;
};

export const convertCurlToCode = (curlString) => {
  const parsed = parseCurl(curlString);
  return {
    parsed,
    axios: generateAxiosCode(parsed),
    fetch: generateFetchCode(parsed),
  };
};
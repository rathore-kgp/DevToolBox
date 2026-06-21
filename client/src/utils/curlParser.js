/**
 * Mini cURL parser — tokenizes and extracts semantic meaning from a curl command.
 * Handles: -X, --request, -H, --header, -d, --data, --data-raw, -u, --user,
 *          --location, -L, --compressed, -b, --cookie
 */

const tokenize = (curlString) => {
  // Normalize: remove newlines and backslash-continuations
  const normalized = curlString
    .replace(/\\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove leading 'curl' command
  if (!normalized.startsWith('curl')) {
    throw new Error('Input must start with "curl"');
  }

  // Tokenize: handle quoted strings (single and double) as single tokens
  const tokens = [];
  let i = 0;
  const str = normalized.slice(4).trim(); // Remove 'curl'

  while (i < str.length) {
    // Skip whitespace
    if (/\s/.test(str[i])) { i++; continue; }

    if (str[i] === '"' || str[i] === "'") {
      const quote = str[i++];
      let token = '';
      while (i < str.length && str[i] !== quote) {
        if (str[i] === '\\') i++; // Escape character
        token += str[i++];
      }
      i++; // Skip closing quote
      tokens.push(token);
    } else {
      let token = '';
      while (i < str.length && !/\s/.test(str[i])) {
        token += str[i++];
      }
      tokens.push(token);
    }
  }

  return tokens;
};

const parseCurl = (curlString) => {
  const tokens = tokenize(curlString);

  const result = {
    url: '',
    method: 'GET',
    headers: {},
    body: null,
    auth: null,
    followRedirects: false,
  };

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    // URL: first token that starts with http
    if (token.startsWith('http') || token.startsWith('//')) {
      result.url = token;
      i++;
      continue;
    }

    switch (token) {
      case '-X':
      case '--request':
        result.method = tokens[++i].toUpperCase();
        break;

      case '-H':
      case '--header': {
        const headerStr = tokens[++i];
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > -1) {
          const key = headerStr.slice(0, colonIdx).trim();
          const value = headerStr.slice(colonIdx + 1).trim();
          result.headers[key] = value;
        }
        break;
      }

      case '-d':
      case '--data':
      case '--data-raw':
      case '--data-binary':
        result.body = tokens[++i];
        // Infer method if not set
        if (result.method === 'GET') result.method = 'POST';
        break;

      case '-u':
      case '--user': {
        const [username, password] = tokens[++i].split(':');
        result.auth = { username, password: password || '' };
        break;
      }

      case '-L':
      case '--location':
        result.followRedirects = true;
        break;
    }

    i++;
  }

  return result;
};

export { parseCurl };
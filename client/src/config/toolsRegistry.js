// Single source of truth for all tools
// Adding a new tool = one entry here, one lazy import, done.
export const TOOLS = [
  {
    id: 'json',
    label: 'JSON Tools',
    path: '/json',
    icon: '{}',
    description: 'Format, validate, minify, and convert JSON',
    category: 'Data',
  },
  {
    id: 'encoding',
    label: 'Encoding Tools',
    path: '/encoding',
    icon: '64',
    description: 'Base64, SHA hashing, UUID generation',
    category: 'Data',
  },
  {
    id: 'regex',
    label: 'Regex Tester',
    path: '/regex',
    icon: '.*',
    description: 'Real-time regex matching with capture groups',
    category: 'Text',
  },
  {
    id: 'jwt',
    label: 'JWT Tools',
    path: '/jwt',
    icon: '🔑',
    description: 'Decode and verify JSON Web Tokens',
    category: 'Security',
  },
  {
    id: 'api-tester',
    label: 'API Tester',
    path: '/api-tester',
    icon: '⚡',
    description: 'Send HTTP requests with a built-in proxy',
    category: 'Network',
  },
  {
    id: 'curl',
    label: 'cURL Converter',
    path: '/curl',
    icon: '↔',
    description: 'Convert cURL commands to Axios/Fetch code',
    category: 'Network',
  },
  {
    id: 'collab',
    label: 'Code Room',
    path: '/collab',
    icon: '👥',
    description: 'Real-time collaborative code editor',
    category: 'Collaboration',
  },
];

export const TOOL_CATEGORIES = [...new Set(TOOLS.map(t => t.category))];
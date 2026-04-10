import type { APIIntegration } from '@/types';

export const freeAPIs: APIIntegration[] = [
  {
    id: 'openweather',
    name: 'OpenWeatherMap',
    description: 'Get current weather and forecasts for any location',
    category: 'data',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    authType: 'apiKey',
    rateLimit: '60 calls/minute (free tier)',
    isFree: true,
    endpoints: [
      {
        name: 'Current Weather',
        method: 'GET',
        path: '/weather',
        description: 'Get current weather by city name or coordinates',
        parameters: [
          { name: 'q', type: 'string', required: true, description: 'City name' },
          { name: 'appid', type: 'string', required: true, description: 'API key' },
          { name: 'units', type: 'string', required: false, description: 'Units: metric/imperial' },
        ],
      },
      {
        name: 'Forecast',
        method: 'GET',
        path: '/forecast',
        description: 'Get 5-day weather forecast',
        parameters: [
          { name: 'q', type: 'string', required: true, description: 'City name' },
          { name: 'appid', type: 'string', required: true, description: 'API key' },
        ],
      },
    ],
  },
  {
    id: 'newsapi',
    name: 'NewsAPI',
    description: 'Get latest news headlines and articles',
    category: 'data',
    baseUrl: 'https://newsapi.org/v2',
    authType: 'apiKey',
    rateLimit: '100 requests/day (free tier)',
    isFree: true,
    endpoints: [
      {
        name: 'Top Headlines',
        method: 'GET',
        path: '/top-headlines',
        description: 'Get top news headlines',
        parameters: [
          { name: 'country', type: 'string', required: false, description: 'Country code (us, gb, etc)' },
          { name: 'category', type: 'string', required: false, description: 'Category: business, tech, etc' },
          { name: 'apiKey', type: 'string', required: true, description: 'API key' },
        ],
      },
      {
        name: 'Everything',
        method: 'GET',
        path: '/everything',
        description: 'Search all articles',
        parameters: [
          { name: 'q', type: 'string', required: true, description: 'Search query' },
          { name: 'apiKey', type: 'string', required: true, description: 'API key' },
        ],
      },
    ],
  },
  {
    id: 'discord-webhook',
    name: 'Discord Webhook',
    description: 'Send messages to Discord channels via webhooks',
    category: 'communication',
    baseUrl: '',
    authType: 'none',
    rateLimit: '30 requests/60 seconds',
    isFree: true,
    endpoints: [
      {
        name: 'Send Message',
        method: 'POST',
        path: '/{webhook_url}',
        description: 'Send a message to Discord channel',
        parameters: [
          { name: 'content', type: 'string', required: true, description: 'Message text' },
          { name: 'username', type: 'string', required: false, description: 'Override username' },
          { name: 'avatar_url', type: 'string', required: false, description: 'Override avatar' },
        ],
      },
    ],
  },
  {
    id: 'libretranslate',
    name: 'LibreTranslate',
    description: 'Free and open source translation API',
    category: 'utility',
    baseUrl: 'https://libretranslate.de',
    authType: 'none',
    rateLimit: 'No strict limit',
    isFree: true,
    endpoints: [
      {
        name: 'Translate',
        method: 'POST',
        path: '/translate',
        description: 'Translate text between languages',
        parameters: [
          { name: 'q', type: 'string', required: true, description: 'Text to translate' },
          { name: 'source', type: 'string', required: true, description: 'Source language code' },
          { name: 'target', type: 'string', required: true, description: 'Target language code' },
        ],
      },
      {
        name: 'Detect Language',
        method: 'POST',
        path: '/detect',
        description: 'Detect language of text',
        parameters: [
          { name: 'q', type: 'string', required: true, description: 'Text to analyze' },
        ],
      },
    ],
  },
  {
    id: 'qrserver',
    name: 'QR Server',
    description: 'Generate QR codes for URLs and text',
    category: 'utility',
    baseUrl: 'https://api.qrserver.com/v1',
    authType: 'none',
    rateLimit: 'No limit',
    isFree: true,
    endpoints: [
      {
        name: 'Create QR Code',
        method: 'GET',
        path: '/create-qr-code',
        description: 'Generate a QR code image',
        parameters: [
          { name: 'data', type: 'string', required: true, description: 'Data to encode' },
          { name: 'size', type: 'string', required: false, description: 'Size: 150x150' },
          { name: 'format', type: 'string', required: false, description: 'Format: png, svg, etc' },
        ],
      },
    ],
  },
  {
    id: 'cleanuri',
    name: 'CleanURI',
    description: 'URL shortening service',
    category: 'utility',
    baseUrl: 'https://cleanuri.com/api/v1',
    authType: 'none',
    rateLimit: 'No limit',
    isFree: true,
    endpoints: [
      {
        name: 'Shorten URL',
        method: 'POST',
        path: '/shorten',
        description: 'Create a short URL',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'Long URL to shorten' },
        ],
      },
    ],
  },
  {
    id: 'jsonplaceholder',
    name: 'JSONPlaceholder',
    description: 'Fake REST API for testing and prototyping',
    category: 'data',
    baseUrl: 'https://jsonplaceholder.typicode.com',
    authType: 'none',
    rateLimit: 'No limit',
    isFree: true,
    endpoints: [
      {
        name: 'Get Posts',
        method: 'GET',
        path: '/posts',
        description: 'Get all posts',
        parameters: [],
      },
      {
        name: 'Get Users',
        method: 'GET',
        path: '/users',
        description: 'Get all users',
        parameters: [],
      },
      {
        name: 'Create Post',
        method: 'POST',
        path: '/posts',
        description: 'Create a new post',
        parameters: [
          { name: 'title', type: 'string', required: true, description: 'Post title' },
          { name: 'body', type: 'string', required: true, description: 'Post content' },
          { name: 'userId', type: 'number', required: true, description: 'User ID' },
        ],
      },
    ],
  },
  {
    id: 'github-api',
    name: 'GitHub API',
    description: 'Access GitHub repositories, issues, and more',
    category: 'productivity',
    baseUrl: 'https://api.github.com',
    authType: 'apiKey',
    rateLimit: '60 requests/hour (unauthenticated)',
    isFree: true,
    endpoints: [
      {
        name: 'Get Repository',
        method: 'GET',
        path: '/repos/{owner}/{repo}',
        description: 'Get repository information',
        parameters: [
          { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
          { name: 'repo', type: 'string', required: true, description: 'Repository name' },
        ],
      },
      {
        name: 'Get Issues',
        method: 'GET',
        path: '/repos/{owner}/{repo}/issues',
        description: 'Get repository issues',
        parameters: [
          { name: 'state', type: 'string', required: false, description: 'Issue state: open/closed' },
        ],
      },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Send emails programmatically',
    category: 'communication',
    baseUrl: 'https://api.sendgrid.com/v3',
    authType: 'apiKey',
    rateLimit: '100 emails/day (free tier)',
    isFree: true,
    endpoints: [
      {
        name: 'Send Email',
        method: 'POST',
        path: '/mail/send',
        description: 'Send an email',
        parameters: [
          { name: 'personalizations', type: 'array', required: true, description: 'Email recipients' },
          { name: 'from', type: 'object', required: true, description: 'Sender info' },
          { name: 'subject', type: 'string', required: true, description: 'Email subject' },
          { name: 'content', type: 'array', required: true, description: 'Email content' },
        ],
      },
    ],
  },
  {
    id: 'twitter-api',
    name: 'Twitter API v2',
    description: 'Post tweets and interact with Twitter',
    category: 'social',
    baseUrl: 'https://api.twitter.com/2',
    authType: 'oauth',
    rateLimit: 'Limited free tier',
    isFree: true,
    endpoints: [
      {
        name: 'Create Tweet',
        method: 'POST',
        path: '/tweets',
        description: 'Post a new tweet',
        parameters: [
          { name: 'text', type: 'string', required: true, description: 'Tweet text (max 280 chars)' },
        ],
      },
      {
        name: 'Get User Tweets',
        method: 'GET',
        path: '/users/{id}/tweets',
        description: 'Get tweets from a user',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'User ID' },
          { name: 'max_results', type: 'number', required: false, description: 'Max tweets to return' },
        ],
      },
    ],
  },
];

export function getAPIById(id: string): APIIntegration | undefined {
  return freeAPIs.find(api => api.id === id);
}

export function getAPIsByCategory(category: APIIntegration['category']): APIIntegration[] {
  return freeAPIs.filter(api => api.category === category);
}

export function searchAPIs(query: string): APIIntegration[] {
  const lowerQuery = query.toLowerCase();
  return freeAPIs.filter(api => 
    api.name.toLowerCase().includes(lowerQuery) ||
    api.description.toLowerCase().includes(lowerQuery) ||
    api.category.toLowerCase().includes(lowerQuery)
  );
}

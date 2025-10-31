// Print Server Configuration
// This is the laptop print server that connects iPad to USB thermal printer

export const PRINT_SERVER_CONFIG = {
  // Default print server URL - update this with your laptop's IP
  DEFAULT_URL: 'http://172.20.10.3:3001',
  
  // Fallback URLs to try if primary fails
  FALLBACK_URLS: [
    'http://192.168.1.100:3001',
    'http://localhost:3001'
  ],
  
  // Connection timeout in milliseconds
  TIMEOUT: 5000,
  
  // Auto-connect on component mount
  AUTO_CONNECT: true,
  
  // Retry connection attempts
  MAX_RETRIES: 3
};

export default PRINT_SERVER_CONFIG;

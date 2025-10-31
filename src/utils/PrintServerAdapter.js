/**
 * Print Server Adapter - Sends print requests to laptop print server
 * This allows iPad to print via HTTP to laptop connected to USB printer
 */

class PrintServerAdapter {
  constructor() {
    // Default to localhost for testing, will be updated to laptop IP for iPad
    this.serverUrl = process.env.REACT_APP_PRINT_SERVER_URL || 'http://localhost:3001';
    this.isConnected = false;
    this.lastStatus = null;
  }

  /**
   * Set the print server URL (usually laptop's local IP)
   * Example: setServerUrl('http://192.168.1.100:3001')
   */
  setServerUrl(url) {
    this.serverUrl = url.replace(/\/$/, ''); // Remove trailing slash
    console.log('🖨️  Print server URL set to:', this.serverUrl);
  }

  /**
   * Get the current server URL
   */
  getServerUrl() {
    return this.serverUrl;
  }

  /**
   * Check if print server is available and printer is connected
   */
  async checkConnection() {
    try {
      const response = await fetch(`${this.serverUrl}/printer/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const status = await response.json();
      this.lastStatus = status;
      this.isConnected = status.connected || status.status === 'simulation';

      console.log('🖨️  Print server status:', status);
      return {
        success: true,
        connected: this.isConnected,
        status: status.status,
        message: status.message,
        mode: status.mode,
      };
    } catch (error) {
      console.error('❌ Failed to connect to print server:', error);
      this.isConnected = false;
      return {
        success: false,
        connected: false,
        error: error.message,
        message: 'Cannot reach print server. Make sure laptop print server is running.',
      };
    }
  }

  /**
   * Print receipt via laptop print server
   * @param {Object} receiptData - Receipt data object
   */
  async print(receiptData) {
    try {
      console.log('📤 Sending print request to laptop server...', {
        orderId: receiptData.orderId,
        total: receiptData.total,
      });

      const response = await fetch(`${this.serverUrl}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Print response:', result);

      return {
        success: true,
        message: result.message || 'Receipt printed successfully',
        mode: result.mode,
        orderId: result.orderId,
      };
    } catch (error) {
      console.error('❌ Print failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to print. Check if laptop print server is running.',
      };
    }
  }

  /**
   * Test the connection with a simple health check
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Server not responding');
      }

      const data = await response.json();
      console.log('✅ Print server is healthy:', data);
      return true;
    } catch (error) {
      console.error('❌ Print server not reachable:', error);
      return false;
    }
  }

  /**
   * Get user-friendly instructions for iPad setup
   */
  getSetupInstructions() {
    return {
      title: '🖨️  Laptop Print Server Setup',
      steps: [
        '1. Make sure laptop is ON and connected to same WiFi as iPad',
        '2. On laptop, open Command Prompt and run: ipconfig',
        '3. Find "IPv4 Address" (example: 192.168.1.100)',
        '4. On iPad, set printer to: http://[your-ip]:3001',
        '5. Test connection - should show "Connected"',
      ],
      example: 'http://192.168.1.100:3001',
    };
  }

  /**
   * Auto-detect laptop IP (only works if on same network)
   * Returns suggested URLs to try
   */
  getSuggestedUrls() {
    const commonPorts = [3001, 3000, 8080];
    const suggestions = [];

    // Common local network patterns
    const baseIPs = [
      '192.168.1',
      '192.168.0',
      '10.0.0',
      '172.16.0',
    ];

    baseIPs.forEach(base => {
      commonPorts.forEach(port => {
        suggestions.push(`${base}.100:${port}`);
        suggestions.push(`${base}.101:${port}`);
      });
    });

    return suggestions.map(s => `http://${s}`);
  }

  /**
   * Check if currently connected to print server
   */
  isServerConnected() {
    return this.isConnected;
  }

  /**
   * Get last known status
   */
  getLastStatus() {
    return this.lastStatus;
  }
}

export default PrintServerAdapter;

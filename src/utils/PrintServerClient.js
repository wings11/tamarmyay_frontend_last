// Print Server Client - Communicates with laptop print server
class PrintServerClient {
  constructor() {
    // Default to localhost - laptop should be accessible from iPad on same network
    this.printServerUrl = process.env.REACT_APP_PRINT_SERVER_URL || 'http://localhost:3001';
    this.isAvailable = false;
    this.lastCheckTime = 0;
    this.checkInterval = 30000; // Check every 30 seconds
  }

  // Check if print server is available
  async checkAvailability() {
    const now = Date.now();
    if (now - this.lastCheckTime < this.checkInterval && this.isAvailable) {
      return this.isAvailable;
    }

    try {
      const response = await fetch(`${this.printServerUrl}/health`, {
        method: 'GET',
        timeout: 5000, // 5 second timeout
      });
      
      this.isAvailable = response.ok;
      this.lastCheckTime = now;
      
      if (this.isAvailable) {
        console.log('✅ Print server is available at:', this.printServerUrl);
      }
      
      return this.isAvailable;
    } catch (error) {
      console.warn('⚠️  Print server not available:', error.message);
      this.isAvailable = false;
      this.lastCheckTime = now;
      return false;
    }
  }

  // Get printer status from laptop
  async getPrinterStatus() {
    try {
      if (!(await this.checkAvailability())) {
        throw new Error('Print server not available');
      }

      const response = await fetch(`${this.printServerUrl}/printer/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const status = await response.json();
      return status;
    } catch (error) {
      console.error('Failed to get printer status:', error);
      throw error;
    }
  }

  // Send print request to laptop print server
  async printReceipt(receiptData) {
    try {
      if (!(await this.checkAvailability())) {
        throw new Error('Print server not available. Make sure your laptop is running the print server.');
      }

      const response = await fetch(`${this.printServerUrl}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Print request sent successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Print request failed:', error);
      throw error;
    }
  }

  // Auto-discover print server on local network (for iPad on same WiFi)
  async autoDiscoverPrintServer() {
    // Try common local network addresses
    const commonAddresses = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://192.168.1.100:3001', // Common router IP ranges
      'http://192.168.0.100:3001',
      'http://10.0.0.100:3001',
    ];

    for (const address of commonAddresses) {
      try {
        const response = await fetch(`${address}/health`, {
          method: 'GET',
          timeout: 3000,
        });
        
        if (response.ok) {
          this.printServerUrl = address;
          this.isAvailable = true;
          console.log('🔍 Auto-discovered print server at:', address);
          return address;
        }
      } catch (error) {
        // Continue to next address
        continue;
      }
    }

    console.warn('🔍 Could not auto-discover print server');
    return null;
  }

  // Get the current print server URL
  getPrintServerUrl() {
    return this.printServerUrl;
  }

  // Manually set print server URL (for network configuration)
  setPrintServerUrl(url) {
    this.printServerUrl = url;
    this.isAvailable = false; // Force recheck
    this.lastCheckTime = 0;
  }
}

export default PrintServerClient;
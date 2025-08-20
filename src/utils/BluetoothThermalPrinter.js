// Bluetooth thermal printer utility
class BluetoothThermalPrinter {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isTestMode = !navigator.bluetooth; // Auto-enable test mode if no Bluetooth API
  }

  async connect() {
    try {
      // Test mode - simulate connection
      if (this.isTestMode || !navigator.bluetooth) {
        console.log('🧪 TEST MODE: Simulating Bluetooth printer connection...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection delay
        console.log('✅ TEST MODE: Mock Bluetooth printer connected!');
        this.device = { mock: true };
        return true;
      }

      // Real Bluetooth connection
      console.log('Requesting Bluetooth device...');
      
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Standard thermal printer service
          { namePrefix: 'MTP-' }, // Many thermal printers start with MTP
          { namePrefix: 'POS-' }, // POS printers
          { namePrefix: 'BTP-' }, // Bluetooth thermal printer
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      console.log('Connecting to GATT server...');
      this.server = await this.device.gatt.connect();

      console.log('Getting service...');
      this.service = await this.server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');

      console.log('Getting characteristic...');
      this.characteristic = await this.service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      console.log('✅ Real Bluetooth printer connected successfully!');
      return true;
    } catch (error) {
      console.error('❌ Bluetooth connection failed:', error);
      
      // Fallback to test mode
      console.log('🧪 Falling back to TEST MODE...');
      this.isTestMode = true;
      this.device = { mock: true };
      return true;
    }
  }

  async disconnect() {
    if (this.isTestMode) {
      console.log('🧪 TEST MODE: Mock printer disconnected');
      this.device = null;
      return;
    }

    if (this.device && this.device.gatt && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
      console.log('Bluetooth printer disconnected');
    }
  }

  // Convert text to thermal printer commands (ESC/POS)
  formatReceiptForThermalPrint(receiptData) {
    const ESC = '\x1B';
    const GS = '\x1D';
    
    let commands = '';
    
    // Initialize printer
    commands += ESC + '@'; // Initialize
    
    // Header - Center align and bold
    commands += ESC + 'a' + '\x01'; // Center align
    commands += ESC + 'E' + '\x01'; // Bold on
    commands += receiptData.restaurantName || 'TAMARMYAY RESTAURANT';
    commands += '\n';
    commands += ESC + 'E' + '\x00'; // Bold off
    commands += '================================\n';
    
    // Address
    commands += (receiptData.address1 || '52/345-2 Ek Prachim Road, Lak Hok,') + '\n';
    commands += (receiptData.address2 || 'Pathum Thani, 12000') + '\n';
    commands += '\n';
    
    // Order details - Left align
    commands += ESC + 'a' + '\x00'; // Left align
    commands += `Order Type: ${receiptData.orderType}\n`;
    if (receiptData.tableNumber) {
      commands += `Table No: ${receiptData.tableNumber}\n`;
    }
    commands += `Date & Time: ${receiptData.dateTime}\n`;
    commands += `Order ID: ${receiptData.orderId}\n`;
    
    // Customer info for delivery
    if (receiptData.customerName) {
      commands += `Customer: ${receiptData.customerName}\n`;
    }
    if (receiptData.buildingName) {
      commands += `Building: ${receiptData.buildingName}\n`;
    }
    
    commands += '\n';
    commands += '--------------------------------\n';
    commands += 'Item                Qty    Price\n';
    commands += '--------------------------------\n';
    
    // Items
    receiptData.items?.forEach(item => {
      const name = this.truncateText(item.name, 15);
      const qty = item.quantity.toString().padStart(3);
      const price = `${parseFloat(item.price).toFixed(2)} B`.padStart(8);
      commands += `${name.padEnd(15)} ${qty} ${price}\n`;
    });
    
    commands += '--------------------------------\n';
    
    // Total - Right align
    commands += ESC + 'a' + '\x02'; // Right align
    commands += ESC + 'E' + '\x01'; // Bold on
    commands += `Total: ${parseFloat(receiptData.total).toFixed(2)} B\n`;
    commands += ESC + 'E' + '\x00'; // Bold off
    commands += ESC + 'a' + '\x00'; // Left align
    commands += '--------------------------------\n';
    
    // Payment method
    if (receiptData.paymentMethod) {
      commands += `Payment: ${receiptData.paymentMethod}\n`;
    }
    
    // Customer note
    if (receiptData.customerNote && receiptData.customerNote.trim()) {
      commands += `Note: ${receiptData.customerNote}\n`;
    }
    
    commands += '\n';
    
    // Footer - Center align
    commands += ESC + 'a' + '\x01'; // Center align
    commands += receiptData.footerMessage || 'Thank You & See You Again';
    commands += '\n\n\n';
    
    // Cut paper
    commands += GS + 'V' + '\x01'; // Partial cut
    
    return commands;
  }

  // Convert receipt to readable format for testing
  formatReceiptForConsole(receiptData) {
    let output = '\n';
    output += '='.repeat(32) + '\n';
    output += '      ' + (receiptData.restaurantName || 'TAMARMYAY RESTAURANT') + '\n';
    output += '='.repeat(32) + '\n';
    output += '\n';
    output += (receiptData.address1 || '52/345-2 Ek Prachim Road, Lak Hok,') + '\n';
    output += (receiptData.address2 || 'Pathum Thani, 12000') + '\n';
    output += '\n';
    output += `Order Type: ${receiptData.orderType}\n`;
    if (receiptData.tableNumber) {
      output += `Table No: ${receiptData.tableNumber}\n`;
    }
    output += `Date & Time: ${receiptData.dateTime}\n`;
    output += `Order ID: ${receiptData.orderId}\n`;
    
    if (receiptData.customerName) {
      output += `Customer: ${receiptData.customerName}\n`;
    }
    if (receiptData.buildingName) {
      output += `Building: ${receiptData.buildingName}\n`;
    }
    
    output += '\n';
    output += '-'.repeat(32) + '\n';
    output += 'Item                Qty    Price\n';
    output += '-'.repeat(32) + '\n';
    
    receiptData.items?.forEach(item => {
      const name = this.truncateText(item.name, 15);
      const qty = item.quantity.toString().padStart(3);
      const price = `${parseFloat(item.price).toFixed(2)} B`.padStart(8);
      output += `${name.padEnd(15)} ${qty} ${price}\n`;
    });
    
    output += '-'.repeat(32) + '\n';
    output += `Total: ${parseFloat(receiptData.total).toFixed(2)} B`.padStart(32) + '\n';
    output += '-'.repeat(32) + '\n';
    
    if (receiptData.paymentMethod) {
      output += `Payment: ${receiptData.paymentMethod}\n`;
    }
    
    if (receiptData.customerNote && receiptData.customerNote.trim()) {
      output += `Note: ${receiptData.customerNote}\n`;
    }
    
    output += '\n';
    output += '   ' + (receiptData.footerMessage || 'Thank You & See You Again') + '\n';
    output += '\n\n';
    
    return output;
  }

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }

  async print(receiptData) {
    try {
      if (this.isTestMode || (this.device && this.device.mock)) {
        // Test mode - show receipt in console and alert
        console.log('🧪 TEST MODE: Printing receipt...');
        
        const readableReceipt = this.formatReceiptForConsole(receiptData);
        console.log(readableReceipt);
        
        // Show receipt in a modal-like alert
        const shortReceipt = `📄 RECEIPT PREVIEW:\n\n${receiptData.restaurantName || 'TAMARMYAY RESTAURANT'}\nOrder ${receiptData.orderId}\nTable ${receiptData.tableNumber || 'N/A'}\nTotal: ${receiptData.total} B\n\n✅ Would print to thermal printer!`;
        
        alert(shortReceipt);
        
        console.log('✅ TEST MODE: Receipt printed successfully!');
        return true;
      }

      // Real printer mode
      if (!this.characteristic) {
        throw new Error('Printer not connected');
      }

      const commands = this.formatReceiptForThermalPrint(receiptData);
      const encoder = new TextEncoder();
      const data = encoder.encode(commands);
      
      // Send data in chunks (some printers have buffer limits)
      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay between chunks
      }
      
      console.log('✅ Receipt printed successfully via Bluetooth!');
      return true;
    } catch (error) {
      console.error('❌ Print failed:', error);
      throw error;
    }
  }
}

export default BluetoothThermalPrinter;

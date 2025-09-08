// Bluetooth thermal printer utility
class BluetoothThermalPrinter {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isTestMode = !navigator.bluetooth;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.autoReconnect = true;
  }

  async connect() {
    try {
      if (this.isTestMode || !navigator.bluetooth) {
        console.log('TEST MODE: Simulating connection...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.device = { mock: true };
        this.isConnected = true;
        return true;
      }

      if (this.isConnected && this.device && this.device.gatt && this.device.gatt.connected) {
        console.log('Already connected to:', this.device.name);
        return true;
      }

      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
          { namePrefix: 'XP-' },
          { namePrefix: 'MTP-' },
          { namePrefix: 'POS-' },
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      this.server = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      this.characteristic = await this.service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    this.autoReconnect = false; // Disable auto-reconnect for manual disconnection
    
    if (this.isTestMode) {
      console.log('🧪 TEST MODE: Mock printer disconnected');
      this.device = null;
      this.isConnected = false;
      return;
    }

    if (this.device && this.device.gatt && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
      console.log('📡 Bluetooth printer disconnected from session');
      this.isConnected = false;
    }
  }

  containsBurmese(text) {
    return /[\u1000-\u109F\uAA60-\uAA7F]/.test(text);
  }

  convertMyanmarToPhonetic(text) {
    const myanmarToEnglish = {
      'ကြက်သား': 'Chicken',
      'ဝက်သား': 'Pork', 
      'ငါး': 'Fish',
      'ထမင်း': 'Rice',
      'လက်ဖက်ရည်': 'Tea',
      'ကော်ဖီ': 'Coffee',
      'မုန်လာဥနီ': 'Monlani',
      'ကြက်ဥ': 'Egg',
      'ချက်ခင်း': 'Fried',
      'အသား': 'Meat',
      'အမဲသား': 'Beef',
      'ရေ': 'Water',
      'ပုဇွန်': 'Shrimp',
      'ဟင်း': 'Curry'

    };
    
    if (myanmarToEnglish[text]) {
      return myanmarToEnglish[text];
    }
    
    for (const [myanmar, english] of Object.entries(myanmarToEnglish)) {
      if (text.includes(myanmar)) {
        return text.replace(myanmar, english);
      }
    }
    
    const simplified = text.replace(/[\u1000-\u109F\uAA60-\uAA7F]/g, '');
    return simplified.trim().length > 0 ? simplified.trim() : 'Item';
  }

  async formatReceiptForThermalPrint(receiptData) {
    const ESC = '\x1B';
    const GS = '\x1D';
    
    let commands = '';
    commands += ESC + '@';
    commands += ESC + 't' + '\x00';
    
    // Header
    commands += ESC + 'a' + '\x01';
    commands += ESC + 'E' + '\x01';
    commands += receiptData.restaurantName || 'TAMARMYAY RESTAURANT';
    commands += '\n';
    commands += ESC + 'E' + '\x00';
    commands += '================================\n';
    
    commands += (receiptData.address1 || '52/345-2 Ek Prachim Road, Lak Hok,') + '\n';
    commands += (receiptData.address2 || 'Pathum Thani, 12000') + '\n\n';
    
    // Order details with colon alignment
    commands += ESC + 'a' + '\x00';
    commands += `Order Type : ${receiptData.orderType}\n`;
    if (receiptData.tableNumber) {
      commands += `Table No   : ${receiptData.tableNumber}\n`;
    }
    
    const dateTime = receiptData.dateTime || new Date().toLocaleString();
    const [datePart, timePart] = dateTime.includes(',') ? 
      dateTime.split(', ') : 
      [dateTime.split(' ').slice(0, 3).join(' '), dateTime.split(' ').slice(3).join(' ')];
    
    commands += `Date       : ${datePart}\n`;
    commands += `Time       : ${timePart}\n`;
    commands += `Order ID   : ${receiptData.orderId}\n\n`;
    
    commands += '--------------------------------\n';
    commands += 'Item            Qty     Price\n';
    commands += '--------------------------------\n';
    
    receiptData.items?.forEach(item => {
      let itemName = item.name || '';
      
      if (this.containsBurmese(itemName)) {
        itemName = this.convertMyanmarToPhonetic(itemName);
      }
      
      if (itemName.length > 15) {
        itemName = itemName.substring(0, 12) + '...';
      }
      
      const qty = String(item.quantity || 1);
      const price = `${parseFloat(item.price || 0).toFixed(2)}`;
      
      const paddedName = itemName.padEnd(15).substring(0, 15);
      const paddedQty = qty.padStart(3);
      const paddedPrice = price.padStart(8);
      
      commands += `${paddedName} ${paddedQty} ${paddedPrice}\n`;
    });
    
    commands += '--------------------------------\n';
    commands += ESC + 'a' + '\x02';
    commands += ESC + 'E' + '\x01';
    commands += `Total: ${parseFloat(receiptData.total).toFixed(2)}\n`;
    commands += ESC + 'E' + '\x00';
    commands += ESC + 'a' + '\x00';
    commands += '--------------------------------\n\n';
    
    commands += ESC + 'a' + '\x01';
    commands += receiptData.footerMessage || 'Thank You & See You Again';
    commands += '\n\n\n';
    
    commands += GS + 'V' + '\x01';
    
    return commands;
  }

  async print(receiptData) {
    try {
      // Check connection first, auto-connect if needed
      if (!this.checkConnection()) {
        console.log('🔄 Printer not connected, attempting to connect...');
        await this.connect();
      }

      if (this.isTestMode || (this.device && this.device.mock)) {
        console.log('TEST MODE: Printing receipt...');
        let output = '\n=== THERMAL RECEIPT ===\n';
        output += receiptData.restaurantName + '\n';
        output += '================================\n';
        output += receiptData.address1 + '\n';
        output += receiptData.address2 + '\n\n';
        output += `Order Type : ${receiptData.orderType}\n`;
        if (receiptData.tableNumber) {
          output += `Table No   : ${receiptData.tableNumber}\n`;
        }
        
        const dateTime = receiptData.dateTime || new Date().toLocaleString();
        const [datePart, timePart] = dateTime.includes(',') ? 
          dateTime.split(', ') : 
          [dateTime.split(' ').slice(0, 3).join(' '), dateTime.split(' ').slice(3).join(' ')];
        
        output += `Date       : ${datePart}\n`;
        output += `Time       : ${timePart}\n`;
        output += `Order ID   : ${receiptData.orderId}\n\n`;
        output += 'Item            Qty     Price\n';
        output += '--------------------------------\n';
        
        receiptData.items?.forEach(item => {
          let itemName = item.name || '';
          
          if (this.containsBurmese(itemName)) {
            const originalName = itemName;
            const englishName = this.convertMyanmarToPhonetic(itemName);
            output += `${originalName} → ${englishName}\n`;
            itemName = englishName;
          }
          
          if (itemName.length > 15) {
            itemName = itemName.substring(0, 12) + '...';
          }
          
          const qty = String(item.quantity || 1);
          const price = `${parseFloat(item.price || 0).toFixed(2)}`;
          
          const paddedName = itemName.padEnd(15).substring(0, 15);
          const paddedQty = qty.padStart(3);
          const paddedPrice = price.padStart(8);
          
          output += `${paddedName} ${paddedQty} ${paddedPrice}\n`;
        });
        
        output += '--------------------------------\n';
        output += `Total: ${parseFloat(receiptData.total).toFixed(2)}\n`;
        output += '================================\n';
        output += receiptData.footerMessage + '\n';
        
        console.log(output);
        return true;
      }

      // Real printer - connection is already verified above
      const commands = await this.formatReceiptForThermalPrint(receiptData);
      const encoder = new TextEncoder('utf-8');
      const data = encoder.encode(commands);
      
      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      console.log('✅ Receipt printed successfully on persistent connection!');
      return true;
    } catch (error) {
      console.error('Print failed:', error);
      // If printing failed, mark as disconnected so next print will try to reconnect
      this.isConnected = false;
      throw error;
    }
  }

  checkConnection() {
    if (this.isTestMode) return true;
    return this.isConnected && this.device && this.device.gatt && this.device.gatt.connected;
  }
}

export default BluetoothThermalPrinter;

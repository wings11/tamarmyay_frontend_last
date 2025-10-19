const express = require('express');
const cors = require('cors');
// Load environment variables
require('dotenv').config();

// Printer dependencies - ready for production
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Serial = require('escpos-serialport');
escpos.Network = require('escpos-network');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Store for printer device (will be set when printer is connected)
let printer = null;
let printerStatus = 'disconnected';

// Initialize printer connection
const initializePrinter = () => {
  try {
    const printerType = process.env.PRINTER_TYPE || 'USB';
    console.log(`🖨️  Initializing ${printerType} printer...`);
    
    // Try to connect to USB printer regardless of environment
    if (printerType.toLowerCase() === 'usb') {
      try {
        console.log('🔍 Searching for USB thermal printer...');
        
        // Try multiple USB detection methods for Xprinter XP-58IIH
        let device;
        
        try {
          // Method 1: Auto-detect USB printer
          device = new escpos.USB();
          console.log('📡 Auto-detection method: Found USB device');
        } catch (autoError) {
          console.log('⚠️  Auto-detection failed:', autoError.message);
          
          try {
            // Method 2: Try specific vendor/product IDs for common thermal printers
            // Common Xprinter vendor IDs: 0x0fe6, 0x1fc9, 0x04b8
            device = new escpos.USB(0x0fe6); // Xprinter vendor ID
            console.log('📡 Vendor ID method: Found Xprinter device');
          } catch (vendorError) {
            console.log('⚠️  Vendor ID method failed:', vendorError.message);
            
            // Method 3: Try alternative vendor IDs
            try {
              device = new escpos.USB(0x1fc9); // Alternative Xprinter ID
              console.log('📡 Alternative vendor ID: Found device');
            } catch (altError) {
              console.log('⚠️  All USB detection methods failed');
              throw new Error('No compatible USB thermal printer found');
            }
          }
        }
        
        printer = new escpos.Printer(device, { 
          encoding: 'GB18030',
          width: 48 // 48 characters for 58mm thermal printer
        });
        
        printerStatus = 'connected';
        console.log('✅ USB Xprinter XP-58IIH detected and configured successfully!');
        console.log('🖨️  Ready for actual thermal printing');
        
      } catch (usbError) {
        console.log('⚠️  USB printer not detected:', usbError.message);
        console.log('💡 Troubleshooting checklist:');
        console.log('   1. ✓ Printer connected via USB cable?');
        console.log('   2. ✓ Printer powered ON (solid LED)?');
        console.log('   3. ✓ Windows detected the device? (Device Manager shows "Unknown" - needs driver)');
        console.log('   4. ✓ Try installing proper Xprinter drivers');
        console.log('   5. ✓ Alternative: Use Bluetooth printing (which is working)');
        
        printer = null;
        printerStatus = 'simulation';
        console.log('📝 Running in simulation mode - console output only');
      }
    } else {
      // Other printer types (serial, network)
      printerStatus = 'simulation';
      console.log(`⚠️  ${printerType} printer type not fully implemented yet`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize printer:', error.message);
    printerStatus = 'error';
    printer = null;
    return false;
  }
};

// Format receipt content exactly like your current design
const formatReceipt = (receiptData) => {
  const {
    restaurantName = "TAMARMYAY RESTAURANT",
    address1 = "52/345-2 Ek Prachim Road, Lak Hok,",
    address2 = "Pathum Thani, 12000",
    orderType,
    tableNumber,
    dateTime,
    orderId,
    customerName,
    buildingName,
    items = [],
    total,
    paymentMethod,
    customerNote,
    footerMessage = "Thank You & See You Again"
  } = receiptData;

  let receipt = '';
  
  // Header with logo space
  receipt += '\n';
  receipt += '================================\n';
  receipt += '      ' + restaurantName + '\n';
  receipt += '================================\n';
  receipt += '\n';
  
  // Address
  receipt += centerText(address1, 32) + '\n';
  receipt += centerText(address2, 32) + '\n';
  receipt += '\n';
  
  // Order Details
  receipt += `Order Type: ${orderType}\n`;
  if (tableNumber) {
    receipt += `Table No: ${tableNumber}\n`;
  }
  receipt += `Date & Time: ${dateTime}\n`;
  receipt += `Order ID: ${orderId}\n`;
  
  // Customer info for delivery
  if (orderType === 'Delivery' && customerName) {
    receipt += `Customer: ${customerName}\n`;
    if (buildingName) {
      receipt += `Building: ${buildingName}\n`;
    }
  }
  
  receipt += '\n';
  receipt += '--------------------------------\n';
  receipt += 'Item                Qty    Price\n';
  receipt += '--------------------------------\n';
  
  // Items
  items.forEach(item => {
    const name = truncateText(item.name, 15);
    const qty = item.quantity.toString().padStart(3);
    const price = `${parseFloat(item.price).toFixed(2)} B`.padStart(8);
    receipt += `${name.padEnd(15)} ${qty} ${price}\n`;
  });
  
  receipt += '--------------------------------\n';
  receipt += `Total: ${parseFloat(total).toFixed(2)} B`.padStart(32) + '\n';
  receipt += '--------------------------------\n';
  
  if (paymentMethod) {
    receipt += `Payment: ${paymentMethod}\n`;
  }
  
  if (customerNote && customerNote.trim()) {
    receipt += `Note: ${customerNote}\n`;
  }
  
  receipt += '\n';
  receipt += centerText(footerMessage, 32) + '\n';
  receipt += '\n\n\n';
  
  return receipt;
};

// Helper functions
const centerText = (text, width) => {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
};

const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
};

// Print endpoint with smart routing
app.post('/print', async (req, res) => {
  try {
    const receiptData = req.body;
    console.log('Received print request:', receiptData);
    
    const formattedReceipt = formatReceipt(receiptData);
    
    if (printer) {
      // Method 1: USB Thermal Printer (preferred)
      console.log('🖨️  Printing via USB thermal printer...');
      printer.open(() => {
        printer
          .font('a')
          .align('ct')
          .style('bu')
          .size(1, 1)
          .text(receiptData.restaurantName || 'TAMARMYAY RESTAURANT')
          .text('\n')
          .text('================================')
          .text('\n\n')
          .align('ct')
          .style('normal')
          .size(0, 0)
          .text(receiptData.address1 || '52/345-2 Ek Prachim Road, Lak Hok,')
          .text(receiptData.address2 || 'Pathum Thani, 12000')
          .text('\n\n')
          .align('lt')
          .text(`Order Type: ${receiptData.orderType}`)
          
        if (receiptData.tableNumber) {
          printer.text(`Table No: ${receiptData.tableNumber}`);
        }
        
        printer
          .text(`Date & Time: ${receiptData.dateTime}`)
          .text(`Order ID: ${receiptData.orderId}`)
          
        if (receiptData.customerName) {
          printer.text(`Customer: ${receiptData.customerName}`);
        }
        
        if (receiptData.buildingName) {
          printer.text(`Building: ${receiptData.buildingName}`);
        }
        
        printer
          .text('\n')
          .text('--------------------------------')
          .text('Item                Qty    Price')
          .text('--------------------------------')
          
        receiptData.items.forEach(item => {
          const name = truncateText(item.name, 15);
          const qty = item.quantity.toString().padStart(3);
          const price = `${parseFloat(item.price).toFixed(2)} B`.padStart(8);
          printer.text(`${name.padEnd(15)} ${qty} ${price}`);
        });
        
        printer
          .text('--------------------------------')
          .align('rt')
          .style('bu')
          .text(`Total: ${parseFloat(receiptData.total).toFixed(2)} B`)
          .style('normal')
          .text('--------------------------------')
          
        if (receiptData.paymentMethod) {
          printer.text(`Payment: ${receiptData.paymentMethod}`);
        }
        
        if (receiptData.customerNote && receiptData.customerNote.trim()) {
          printer.text(`Note: ${receiptData.customerNote}`);
        }
        
        printer
          .text('\n')
          .align('ct')
          .text(receiptData.footerMessage || 'Thank You & See You Again')
          .text('\n\n\n')
          .cut()
          .close();
      });
    } else {
      // Method 2: Simulation mode with helpful instructions
      console.log('\n' + '='.repeat(50));
      console.log('PRINTING RECEIPT (SIMULATION MODE):');
      console.log('='.repeat(50));
      console.log(formattedReceipt);
      console.log('='.repeat(50));
      console.log('💡 To enable real printing:');
      console.log('   1. Fix USB driver (Device Manager shows "Unknown")');
      console.log('   2. Install proper Xprinter drivers');
      console.log('   3. Or use Bluetooth direct from frontend');
    }
    
    res.json({ 
      success: true, 
      message: 'Receipt printed successfully',
      mode: printer ? 'usb-thermal' : 'simulation',
      suggestion: printer ? null : 'USB driver issue detected - Bluetooth printing recommended'
    });
    
  } catch (error) {
    console.error('Print error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Print failed', 
      error: error.message,
      suggestion: 'Try Bluetooth printing from frontend as fallback'
    });
  }
});

// Test printer connection
app.get('/printer/status', (req, res) => {
  res.json({ 
    connected: !!printer,
    status: printerStatus,
    mode: printer ? 'actual' : 'simulation',
    message: printer ? 'Printer connected and ready' : `Running in ${printerStatus} mode`,
    environment: NODE_ENV,
    printerType: process.env.PRINTER_TYPE || 'USB'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Print server running on http://localhost:${PORT}`);
  initializePrinter();
});

module.exports = app;

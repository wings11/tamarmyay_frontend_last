const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
// Load environment variables
require('dotenv').config();

// USB Printer Libraries - Now enabled for production use
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Store for printer device (will be set when printer is connected)
let printer = null;
let printerStatus = 'disconnected';
let windowsPrinterName = process.env.WINDOWS_PRINTER_NAME || 'XP-58 (copy 1)';

// Print to Windows printer using raw text
const printToWindowsPrinter = (receiptText) => {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `receipt_${Date.now()}.txt`);
    
    // Write receipt to temp file
    fs.writeFileSync(tempFile, receiptText, 'utf8');
    
    // Print using Windows command
    const printCommand = `print /D:"${windowsPrinterName}" "${tempFile}"`;
    
    exec(printCommand, (error, stdout, stderr) => {
      // Clean up temp file
      try { fs.unlinkSync(tempFile); } catch (e) { }
      
      if (error) {
        console.error('Windows print error:', error);
        reject(error);
      } else {
        console.log('✅ Printed to Windows printer:', windowsPrinterName);
        resolve(true);
      }
    });
  });
};

// Initialize printer connection
const initializePrinter = () => {
  try {
    console.log('🖨️  Checking printer connections...');
    console.log(`📍 Windows printer name: "${windowsPrinterName}"`);
    
    // On Windows, we'll use the Windows printer API as primary method
    if (process.platform === 'win32') {
      console.log('✅ Windows detected - will use Windows print commands');
      console.log(`🖨️  Target printer: "${windowsPrinterName}"`);
      printerStatus = 'connected';
      printer = 'windows'; // Marker for Windows printing mode
      console.log('📍 Print server ready to receive requests from iPad');
      return true;
    }
    
    // For non-Windows, try USB direct connection
    console.log('🖨️  Attempting direct USB connection...');
    const device = new escpos.USB();
    
    device.open((error) => {
      if (error) {
        console.error('❌ USB printer not found:', error.message);
        console.log('⚠️  Running in SIMULATION mode');
        printerStatus = 'simulation';
        printer = null;
        return;
      }
      
      printer = new escpos.Printer(device);
      printerStatus = 'connected';
      console.log('✅ USB printer connected successfully!');
      device.close();
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize printer:', error.message);
    console.log('⚠️  Running in SIMULATION mode');
    printerStatus = 'simulation';
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

// Print endpoint - Receives requests from iPad
app.post('/print', async (req, res) => {
  try {
    const receiptData = req.body;
    console.log('📱 Received print request from iPad:', {
      orderId: receiptData.orderId,
      total: receiptData.total,
      items: receiptData.items?.length || 0
    });
    
    const formattedReceipt = formatReceipt(receiptData);
    
    // Windows printer method (primary for Windows systems)
    if (printerStatus === 'connected' && printer === 'windows' && process.platform === 'win32') {
      try {
        await printToWindowsPrinter(formattedReceipt);
        
        res.json({ 
          success: true, 
          message: `Receipt sent to Windows printer: ${windowsPrinterName}`,
          mode: 'windows-printer',
          orderId: receiptData.orderId,
          printer: windowsPrinterName
        });
        return;
      } catch (printError) {
        console.error('⚠️  Windows print failed:', printError.message);
        // Fall through to simulation
      }
    }
    
    // USB Direct method (for non-Windows or fallback)
    if (printerStatus === 'connected' && printer !== 'windows') {
      try {
        const device = new escpos.USB();
        
        device.open((error) => {
          if (error) {
            console.error('⚠️  USB printer busy, printing to console instead');
            console.log('\n' + '='.repeat(50));
            console.log('SIMULATION PRINT:');
            console.log('='.repeat(50));
            console.log(formattedReceipt);
            console.log('='.repeat(50));
            return;
          }
          
          const thermalPrinter = new escpos.Printer(device);
          
          // Print with ESC/POS commands
          thermalPrinter
            .font('a')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text(receiptData.restaurantName || 'TAMARMYAY RESTAURANT')
            .size(0, 0)
            .style('normal')
            .text('================================')
            .text(receiptData.address1 || '52/345-2 Ek Prachim Road, Lak Hok,')
            .text(receiptData.address2 || 'Pathum Thani, 12000')
            .text('')
            .align('lt')
            .text(`Order Type: ${receiptData.orderType}`)
            .text(receiptData.tableNumber ? `Table No: ${receiptData.tableNumber}` : '')
            .text(`Date & Time: ${receiptData.dateTime}`)
            .text(`Order ID: ${receiptData.orderId}`)
            .text('')
            .text('--------------------------------')
            .text('Item                Qty    Price')
            .text('--------------------------------');
          
          // Print items
          receiptData.items?.forEach(item => {
            const name = truncateText(item.name, 15).padEnd(15);
            const qty = item.quantity.toString().padStart(3);
            const price = `${parseFloat(item.price).toFixed(2)} B`.padStart(10);
            thermalPrinter.text(`${name} ${qty} ${price}`);
          });
          
          thermalPrinter
            .text('--------------------------------')
            .align('rt')
            .style('bu')
            .text(`Total: ${parseFloat(receiptData.total).toFixed(2)} B`)
            .style('normal')
            .align('lt')
            .text('--------------------------------')
            .text(receiptData.paymentMethod ? `Payment: ${receiptData.paymentMethod}` : '')
            .text(receiptData.customerNote ? `Note: ${receiptData.customerNote}` : '')
            .text('')
            .align('ct')
            .text(receiptData.footerMessage || 'Thank You & See You Again')
            .text('')
            .text('')
            .text('')
            .cut()
            .close();
          
          console.log('✅ Receipt printed successfully via USB!');
        });
        
        res.json({ 
          success: true, 
          message: 'Receipt sent to USB printer',
          mode: 'usb-direct',
          orderId: receiptData.orderId
        });
        return;
        
      } catch (printError) {
        console.error('⚠️  USB print failed:', printError.message);
        // Fall through to simulation
      }
    }
    
    // Simulation mode - print to console
    console.log('\n' + '='.repeat(50));
    console.log('SIMULATION PRINT:');
    console.log('='.repeat(50));
    console.log(formattedReceipt);
    console.log('='.repeat(50));
    
    res.json({ 
      success: true, 
      message: 'Receipt printed (simulation mode - printer not detected)',
      mode: 'simulation'
    });
    
  } catch (error) {
    console.error('❌ Print error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Print failed', 
      error: error.message 
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

// Get local IP address for display
const getLocalIP = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const addr of addresses) {
      // Look for IPv4, non-internal address
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return 'localhost';
};

// Start server - Listen on 0.0.0.0 to accept connections from all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Print server running on:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${localIP}:${PORT}`);
  console.log(`${'='.repeat(50)}\n`);
  console.log(`📱 iPad should connect to: http://${localIP}:${PORT}`);
  console.log(`${'='.repeat(50)}\n`);
  initializePrinter();
});

module.exports = app;

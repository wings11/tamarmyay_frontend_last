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
    
    if (NODE_ENV === 'production') {
      console.log(`Initializing ${printerType} printer for production...`);
      
      switch (printerType.toLowerCase()) {
        case 'usb':
          // USB Printer Setup for Xprinter XP-58IIH
          try {
            const device = new escpos.USB();
            printer = new escpos.Printer(device, { encoding: 'GB18030' });
            console.log('✅ USB Xprinter XP-58IIH configured successfully');
          } catch (error) {
            console.log('⚠️  USB printer not found, running in simulation mode');
            printer = null;
          }
          break;
          
        case 'serial':
          // Serial Printer Setup - Uncomment when printer is connected
          // const device = new escpos.Serial(process.env.SERIAL_PORT || 'COM1');
          // printer = new escpos.Printer(device);
          console.log('Serial printer configured (uncomment code when printer connected)');
          break;
          
        case 'network':
          // Network Printer Setup - Uncomment when printer is connected
          // const device = new escpos.Network(process.env.PRINTER_IP || '192.168.1.100');
          // printer = new escpos.Printer(device);
          console.log('Network printer configured (uncomment code when printer connected)');
          break;
          
        default:
          console.log('Unknown printer type, running in simulation mode');
      }
      
      if (printer) {
        printerStatus = 'connected';
        console.log('✅ Printer connected successfully');
      } else {
        printerStatus = 'simulation';
        console.log('⚠️  Running in simulation mode - uncomment printer code when ready');
      }
    } else {
      printerStatus = 'simulation';
      console.log('Development mode - running in simulation');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize printer:', error.message);
    printerStatus = 'error';
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

// Print endpoint
app.post('/print', async (req, res) => {
  try {
    const receiptData = req.body;
    console.log('Received print request:', receiptData);
    
    const formattedReceipt = formatReceipt(receiptData);
    
    if (printer) {
      // Actual Xprinter XP-58IIH printing
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
      // Simulation mode - print to console
      console.log('\n' + '='.repeat(50));
      console.log('PRINTING RECEIPT:');
      console.log('='.repeat(50));
      console.log(formattedReceipt);
      console.log('='.repeat(50));
    }
    
    res.json({ 
      success: true, 
      message: 'Receipt printed successfully',
      mode: printer ? 'actual' : 'simulation'
    });
    
  } catch (error) {
    console.error('Print error:', error);
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

// Start server
app.listen(PORT, () => {
  console.log(`Print server running on http://localhost:${PORT}`);
  initializePrinter();
});

module.exports = app;

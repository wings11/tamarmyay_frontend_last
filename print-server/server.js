const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Your printer name from Windows (.env file)
const PRINTER_NAME = process.env.WINDOWS_PRINTER_NAME || 'XP-58 (copy 1)';

// Enable CORS and JSON
app.use(cors());
app.use(express.json());

// Serve the test HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// Format receipt for POS system
const formatReceipt = (receiptData) => {
  const ESC = '\x1B';
  const GS = '\x1D';
  
  let receipt = '';
  receipt += ESC + '@'; // Initialize printer
  
  // Header
  receipt += ESC + 'a' + '\x01'; // Center align
  receipt += ESC + 'E' + '\x01'; // Bold ON
  receipt += (receiptData.restaurantName || 'TAMARMYAY RESTAURANT') + '\n';
  receipt += ESC + 'E' + '\x00'; // Bold OFF
  receipt += '================================\n';
  receipt += (receiptData.address1 || '52/345-2 Ek Prachim Rd, Lak Hok,') + '\n';
  receipt += (receiptData.address2 || 'Pathum Thani, 12000') + '\n\n';
  
  // Order details
  receipt += ESC + 'a' + '\x00'; // Left align
  receipt += `Order Type: ${receiptData.orderType || 'Dine-in'}\n`;
  if (receiptData.tableNumber) {
    receipt += `Table No: ${receiptData.tableNumber}\n`;
  }
  receipt += `Date & Time: ${receiptData.dateTime || new Date().toLocaleString()}\n`;
  receipt += `Order ID: ${receiptData.orderId || 'N/A'}\n\n`;
  
  // Items header
  receipt += '--------------------------------\n';
  receipt += 'Item            Qty     Price\n';
  receipt += '--------------------------------\n';
  
  // Items
  if (receiptData.items && receiptData.items.length > 0) {
    receiptData.items.forEach(item => {
      const name = (item.name || '').substring(0, 15).padEnd(15);
      const qty = String(item.quantity || 1).padStart(3);
      const price = `${parseFloat(item.price || 0).toFixed(2)}`.padStart(8);
      receipt += `${name} ${qty} ${price}\n`;
    });
  }
  
  receipt += '--------------------------------\n';
  
  // Total
  receipt += ESC + 'a' + '\x02'; // Right align
  receipt += ESC + 'E' + '\x01'; // Bold ON
  receipt += `Total: ${parseFloat(receiptData.total || 0).toFixed(2)} B\n`;
  receipt += ESC + 'E' + '\x00'; // Bold OFF
  receipt += ESC + 'a' + '\x00'; // Left align
  receipt += '--------------------------------\n';
  
  // Payment info
  if (receiptData.paymentMethod) {
    receipt += `Payment: ${receiptData.paymentMethod}\n`;
  }
  if (receiptData.customerNote) {
    receipt += `Note: ${receiptData.customerNote}\n`;
  }
  
  // Footer
  receipt += '\n';
  receipt += ESC + 'a' + '\x01'; // Center align
  receipt += (receiptData.footerMessage || 'Thank You & See You Again') + '\n';
  receipt += '\n\n\n\n';
  receipt += GS + 'V' + '\x01'; // Cut paper
  
  return receipt;
};

// Print endpoint - Receives order data from iPad
app.post('/print', (req, res) => {
  const receiptData = req.body;
  
  console.log('📝 Print request received');
  console.log('   Order ID:', receiptData.orderId || 'N/A');
  console.log('   Items:', receiptData.items?.length || 0);
  console.log('   Total:', receiptData.total || '0');
  
  // Format receipt with ESC/POS commands
  const receipt = formatReceipt(receiptData)
  
  // Method 1: Try direct copy to printer port
  const tempFile = path.join(os.tmpdir(), `receipt_${Date.now()}.txt`);
  fs.writeFileSync(tempFile, receipt, 'binary');
  
  // Try copying directly to printer (works for USB printers)
  // First, let's try the standard print command
  const printCmd1 = `type "${tempFile}" > "\\\\localhost\\${PRINTER_NAME}"`;
  const printCmd2 = `print /D:"${PRINTER_NAME}" "${tempFile}"`;
  const printCmd3 = `copy /B "${tempFile}" "\\\\localhost\\${PRINTER_NAME}"`;
  
  console.log('🖨️  Attempting to print to:', PRINTER_NAME);
  
  // Try method 1: Direct copy
  exec(printCmd3, (error1, stdout1, stderr1) => {
    if (!error1) {
      console.log('✅ Printed using copy command!');
      try { fs.unlinkSync(tempFile); } catch (e) { }
      res.json({
        success: true,
        message: 'Receipt printed using direct copy!',
        method: 'copy',
        printer: PRINTER_NAME
      });
      return;
    }
    
    // Try method 2: Type redirect
    exec(printCmd1, (error2, stdout2, stderr2) => {
      if (!error2) {
        console.log('✅ Printed using type redirect!');
        try { fs.unlinkSync(tempFile); } catch (e) { }
        res.json({
          success: true,
          message: 'Receipt printed using type!',
          method: 'type',
          printer: PRINTER_NAME
        });
        return;
      }
      
      // Try method 3: Standard print
      exec(printCmd2, (error3, stdout3, stderr3) => {
        try { fs.unlinkSync(tempFile); } catch (e) { }
        
        if (!error3) {
          console.log('✅ Printed using print command!');
          res.json({
            success: true,
            message: 'Receipt printed using print!',
            method: 'print',
            printer: PRINTER_NAME
          });
        } else {
          console.error('❌ All print methods failed');
          console.error('Copy error:', error1?.message);
          console.error('Type error:', error2?.message);
          console.error('Print error:', error3?.message);
          res.json({
            success: false,
            message: 'All print methods failed. Check printer connection and name.',
            errors: {
              copy: error1?.message,
              type: error2?.message,
              print: error3?.message
            }
          });
        }
      });
    });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    printer: PRINTER_NAME,
    timestamp: new Date().toISOString() 
  });
});

// List available printers
app.get('/printers', (req, res) => {
  exec('wmic printer get name', (error, stdout, stderr) => {
    if (error) {
      res.json({ error: error.message });
    } else {
      const printers = stdout.split('\n')
        .map(line => line.trim())
        .filter(line => line && line !== 'Name');
      res.json({ 
        printers,
        current: PRINTER_NAME,
        tip: 'Use exact name from this list in server.js'
      });
    }
  });
});

// Get local IP for iPad connection
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const addr of interfaces[name]) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return 'localhost';
};

// Start server on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.clear();
  console.log('\n' + '='.repeat(60));
  console.log('  🖨️  SIMPLE PRINT TEST SERVER');
  console.log('='.repeat(60));
  console.log(`\n  Target Printer: "${PRINTER_NAME}"`);
  console.log('\n  Access from:');
  console.log(`    Laptop:  http://localhost:${PORT}`);
  console.log(`    iPad:    http://${ip}:${PORT}`);
  console.log('\n' + '='.repeat(60));
  console.log('\n  📱 Open this URL in iPad Safari to test!\n');
});

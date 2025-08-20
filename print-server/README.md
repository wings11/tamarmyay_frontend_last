# Tamarmyay Print Server

## Setup Instructions

### 1. Install Dependencies
```bash
cd print-server
npm install
```

### 2. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

### 3. Test the Server
Visit http://localhost:3001/health to check if the server is running.

## Printer Configuration

### When you get your POS printer:

1. **USB Printer:**
   - Connect printer via USB
   - Update `server.js` line 16-17:
   ```javascript
   const device = new escpos.USB();
   printer = new escpos.Printer(device);
   ```

2. **Serial Printer:**
   - Connect via serial port
   - Update `server.js` line 20-21:
   ```javascript
   const device = new escpos.Serial('COM1'); // Windows: COM1, COM2, etc.
   printer = new escpos.Printer(device);
   ```

3. **Network Printer:**
   - Connect via Ethernet
   - Update `server.js`:
   ```javascript
   const device = new escpos.Network('192.168.1.100');
   printer = new escpos.Printer(device);
   ```

## Testing

Currently runs in simulation mode - prints receipts to console.
Your React app will work the same way with actual printer.

## Recommended Printers (Under 2000 THB)

1. **Epson TM-T20II** (~1,500 THB)
2. **Xprinter XP-58IIH** (~800 THB)
3. **HOIN HOP-E58** (~1,200 THB)
4. **POS-5890K** (~900 THB)

All support ESC/POS commands and work with this server.

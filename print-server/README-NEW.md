# 💻 Print Server for Tamarmyay POS

## **iPad → WiFi → Laptop → USB Printer Bridge**

This print server enables wireless printing from iPad to your XPrinter XP-58IIH thermal printer through your laptop.

### **Why This Server?**

Your XPrinter **cannot directly connect to iPad**, but this server solves it:
- ✅ iPad sends print requests via WiFi (HTTP)
- ✅ Laptop receives requests and prints to USB printer
- ✅ Works with existing XPrinter XP-58IIH
- ✅ Multiple iPads can use one laptop/printer

---

## 🚀 **Quick Start**

### **1. Install Dependencies**

```powershell
cd print-server
npm install
```

### **2. Start Server**

**Option A:** Double-click `start-print-server.bat` (easiest)

**Option B:** Run manually:
```powershell
npm start
```

### **3. Find Laptop IP**

```powershell
ipconfig
```

Look for: `IPv4 Address. . . . . . . . . . . : 192.168.1.100`

### **4. Connect iPad**

On iPad, in your POS app:
1. Tap "💻 Setup Laptop Printer"
2. Enter: `http://192.168.1.100:3001` (use your IP)
3. Tap "Test Connection"
4. Start printing! 🎉

---

## 📁 **Files**

- `server.js` - Main print server
- `package.json` - Dependencies
- `.env.example` - Configuration template
- `test-ipad-print.html` - Browser-based test tool
- `start-print-server.bat` - Quick launcher

---

## 🧪 **Testing**

### **Test from Browser**

Open `test-ipad-print.html` in browser:
- On laptop: `http://localhost:3001`
- On iPad: `http://192.168.1.100:3001`

### **Test from Command Line**

Check server health:
```powershell
curl http://localhost:3001/health
```

Check printer status:
```powershell
curl http://localhost:3001/printer/status
```

---

## 🔧 **Configuration**

Copy `.env.example` to `.env` and customize:

```env
PORT=3001
NODE_ENV=production
PRINTER_TYPE=USB
```

---

## 📊 **API Endpoints**

### **GET /health**
Health check endpoint
```json
{ "status": "OK", "timestamp": "2025-11-01T10:30:00.000Z" }
```

### **GET /printer/status**
Check printer connection
```json
{
  "connected": true,
  "status": "connected",
  "mode": "actual",
  "message": "Printer connected and ready"
}
```

### **POST /print**
Send receipt to print

Request body:
```json
{
  "restaurantName": "TAMARMYAY RESTAURANT",
  "address1": "52/345-2 Ek Prachim Rd, Lak Hok,",
  "address2": "Pathum Thani, 12000",
  "orderType": "Dine-in",
  "tableNumber": "5",
  "dateTime": "November 1, 2025, 10:30 AM",
  "orderId": "ORD123",
  "items": [
    { "name": "Pad Thai", "quantity": 2, "price": "120.00" }
  ],
  "total": "120.00",
  "paymentMethod": "Cash",
  "footerMessage": "Thank You & See You Again"
}
```

Response:
```json
{
  "success": true,
  "message": "Receipt sent to printer",
  "mode": "actual",
  "orderId": "ORD123"
}
```

---

## 🛠️ **Troubleshooting**

### Printer not detected

1. Check USB connection
2. Make sure printer is ON
3. Install printer driver (Windows Device Manager)
4. Restart print server

### iPad can't connect

1. Check WiFi - same network?
2. Check Windows Firewall - allow Node.js
3. Verify laptop IP didn't change
4. Print server running?

### Prints to console instead of printer

Running in **simulation mode**:
- Printer driver not installed
- USB device not detected
- Check Device Manager for issues

---

## 🎯 **Production Setup**

### **Auto-start on Windows Boot**

1. Press `Win + R`, type `shell:startup`
2. Create shortcut to `start-print-server.bat`
3. Print server starts automatically when laptop boots

### **Static IP for Laptop**

Prevent IP changes:
- Windows Settings → Network
- WiFi → IP settings → Manual
- Set static IP: `192.168.1.100`

### **Firewall Rule**

Allow incoming connections:
```powershell
netsh advfirewall firewall add rule name="POS Print Server" dir=in action=allow protocol=TCP localport=3001
```

---

## 📦 **Dependencies**

- `express` - Web server
- `cors` - Allow iPad to connect
- `escpos` - Thermal printer commands (ESC/POS)
- `escpos-usb` - USB printer driver
- `dotenv` - Environment configuration

---

## 🔐 **Security**

- Runs on **local network only**
- Not accessible from internet
- No authentication (local WiFi trusted)
- Can add API key if needed

---

## 💡 **Tips**

- Keep laptop plugged in during service
- Test print every morning
- Have Safari print as backup
- Monitor terminal for errors

---

## 📞 **Support**

For full setup instructions, see:
**`../IPAD-LAPTOP-PRINT-SERVER-SETUP.md`**

---

**Your restaurant is now iPad-ready with USB thermal printing!** 🍽️📱🖨️

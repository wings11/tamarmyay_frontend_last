# 🏭 PRODUCTION DEPLOYMENT GUIDE
## Tamarmyay Restaurant POS System

### 📋 CHECKLIST FOR RESTAURANT DEPLOYMENT

#### Hardware Requirements
- [ ] Windows computer/tablet (minimum 4GB RAM)
- [ ] POS thermal printer (USB/Serial connection)
- [ ] Stable internet connection
- [ ] Printer paper rolls (58mm or 80mm thermal)

#### Software Setup
- [ ] Node.js installed (v16 or higher)
- [ ] Git installed (for updates)
- [ ] Printer drivers installed

---

## 🚀 PRODUCTION DEPLOYMENT STEPS

### Step 1: Final Setup
1. **Install printer dependencies:**
   ```bash
   cd print-server
   npm install escpos escpos-usb escpos-serialport
   ```

2. **Configure printer in server.js:**
   - Find your printer's USB Vendor/Product ID
   - Uncomment the appropriate printer code
   - Test connection

### Step 2: Restaurant Launch Day

1. **Start the system:**
   - Double-click `start-restaurant-pos.bat`
   - Verify both servers are running
   - Test print with dummy order

2. **Configure tablets/devices:**
   - Connect to WiFi
   - Bookmark: `http://localhost:3000`
   - Test all functions

3. **Train staff:**
   - Show order creation process
   - Demonstrate printing
   - Explain error handling

### Step 3: Daily Operations

**Morning Startup:**
1. Turn on computer
2. Double-click `start-restaurant-pos.bat`
3. Test print one receipt
4. Begin service

**During Service:**
- Print server runs automatically
- Receipts print immediately
- If printer fails, browser print available

**End of Day:**
- Close POS system windows
- Turn off computer

---

## 🔧 PRINTER CONFIGURATION

### When You Buy Your Printer:

1. **Connect printer via USB**
2. **Find printer details:**
   ```bash
   # Windows Device Manager → USB devices
   # Note: Vendor ID and Product ID
   ```

3. **Update server.js (around line 35):**
   ```javascript
   // UNCOMMENT THESE LINES:
   const device = new escpos.USB();
   printer = new escpos.Printer(device);
   ```

4. **Install printer packages:**
   ```bash
   npm install escpos escpos-usb
   ```

---

## 📱 TABLET CONFIGURATION

### For Restaurant Staff:

1. **Open browser → Bookmark:**
   - `http://localhost:3000` (Main App)
   - `http://localhost:3001/printer/status` (Printer Status)

2. **Create shortcuts on desktop/home screen**

3. **Test all functions:**
   - Create orders ✅
   - Print receipts ✅
   - View history ✅
   - Manage items ✅

---

## 🆘 TROUBLESHOOTING

### Common Issues:

**"Print server unavailable"**
- Check if print server is running
- Restart `start-restaurant-pos.bat`

**"Printer not responding"**
- Check USB connection
- Restart print server
- Use browser print as backup

**"Cannot access app"**
- Check WiFi connection
- Verify server is running
- Try `http://localhost:3000`

### Emergency Backup:
- Browser print always available
- Orders saved to database
- System works without printer

---

## 📊 MONITORING

### Check System Health:
- Visit: `http://localhost:3001/printer/status`
- Should show: "Printer connected and ready"

### Daily Checks:
- [ ] Print server running
- [ ] React app accessible
- [ ] Printer responding
- [ ] Internet connection stable

---

## 🔄 UPDATES & MAINTENANCE

### Weekly:
- Check for system updates
- Test backup printing
- Review order history

### Monthly:
- Clean printer (remove dust)
- Replace printer paper
- Backup order database

---

## 📞 SUPPORT CONTACTS

**Technical Issues:**
- Check this guide first
- Test with browser print
- Restart system if needed

**Critical Problems:**
- Use mobile hotspot if WiFi fails
- Manual receipts as last resort
- Contact technical support

---

## ✅ PRODUCTION READY CHECKLIST

Before opening restaurant:
- [ ] Print server starts automatically
- [ ] Real printer connected and tested
- [ ] Staff trained on system
- [ ] Backup procedures known
- [ ] All tablets configured
- [ ] Test orders completed
- [ ] Receipt paper stocked

**Your POS system is now ready for production! 🎉**

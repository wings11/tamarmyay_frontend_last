# 🖥️ SETUP ON NEW LAPTOP - Step by Step Guide

## 📋 What You Need

- **New laptop** (Windows)
- **USB thermal printer** (XP-58)
- **Same WiFi network** as iPad
- **USB cable** to connect printer

---

## 📦 STEP 1: Install Required Software

### 1.1 Install Node.js

1. Go to: https://nodejs.org/
2. Download **LTS version** (recommended)
3. Run installer, click "Next" until finished
4. Restart computer

### 1.2 Verify Installation

Open Command Prompt and type:
```
node --version
npm --version
```

You should see version numbers. If not, restart computer and try again.

---

## 📁 STEP 2: Copy Project Files

### Option A: Copy from Old Laptop

1. On **old laptop**, go to: `C:\Users\[YourName]\OneDrive\Desktop\Projects\tamar myay\`
2. **Copy the entire `ft` folder** to a USB drive
3. On **new laptop**, paste it to: `C:\Users\[NewName]\OneDrive\Desktop\Projects\tamar myay\`

### Option B: Download from GitHub

1. Go to: https://github.com/wings11/tamarmyay_frontend_last
2. Click **Code** → **Download ZIP**
3. Extract to: `C:\Users\[YourName]\OneDrive\Desktop\Projects\tamar myay\ft`

---

## 🔧 STEP 3: Install Dependencies

### 3.1 Install Main Project Dependencies

Open Command Prompt:
```
cd "C:\Users\[YourName]\OneDrive\Desktop\Projects\tamar myay\ft"
npm install
```

Wait 2-5 minutes for installation to complete.

### 3.2 Install Print Server Dependencies

```
cd print-server
npm install
```

Wait 1-2 minutes.

---

## 🖨️ STEP 4: Configure Printer

### 4.1 Connect Printer

1. **Connect XP-58 printer** to laptop via USB
2. **Turn on printer**
3. Windows should detect it automatically

### 4.2 Find Printer Name

Open Command Prompt:
```
wmic printer get name
```

You'll see a list like:
```
Name
Microsoft Print to PDF
XP-58 (copy 1)
```

**Copy the EXACT name** of your thermal printer (including spaces and parentheses).

### 4.3 Update Configuration

1. Go to: `ft\print-server\`
2. Open `.env` file in Notepad
3. Change this line:
```
WINDOWS_PRINTER_NAME=XP-58 (copy 1)
```
Replace with YOUR printer name from step 4.2

4. **Save and close**

---

## 🌐 STEP 5: Find Laptop IP Address

This is the address iPad will use to connect.

### Option A: Automatic (Recommended)

1. Double-click: `START-RESTAURANT-POS.bat`
2. The IP address will be shown on screen!

### Option B: Manual

Open Command Prompt:
```
ipconfig
```

Look for:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.XXX
```

**Write down this IP address!** Example: `192.168.1.100`

---

## ✅ STEP 6: Update iPad Configuration

### 6.1 Update Print Server URL

1. On new laptop, open: `ft\src\config\printServer.js`
2. Change this line:
```javascript
DEFAULT_URL: 'http://172.20.10.3:3001',
```
Replace `172.20.10.3` with YOUR new laptop IP from Step 5.

Example:
```javascript
DEFAULT_URL: 'http://192.168.1.100:3001',
```

3. **Save the file**

---

## 🚀 STEP 7: Test Everything

### 7.1 Start the System

1. Double-click: `START-RESTAURANT-POS.bat` (on Desktop)
2. Wait 10 seconds
3. Two windows will open

### 7.2 Test on Laptop First

1. Open browser on laptop
2. Go to: `http://localhost:3000`
3. Create a test order and try to print
4. Receipt should print from XP-58 printer

### 7.3 Test from iPad

1. Connect iPad to **same WiFi** as laptop
2. Open Safari on iPad
3. Go to: `http://[YOUR-LAPTOP-IP]:3000`
   - Example: `http://192.168.1.100:3000`
4. Create test order and print
5. Receipt should print!

---

## 🎯 STEP 8: Create Desktop Shortcut

1. Go to: `ft` folder
2. Right-click: `CREATE-DESKTOP-SHORTCUT.bat`
3. Click: **"Run as administrator"**
4. Shortcut will appear on Desktop!

---

## ⚠️ Troubleshooting

### Problem: "npm is not recognized"

**Solution:** Node.js is not installed or computer needs restart.
- Reinstall Node.js from step 1.1
- Restart computer

### Problem: "Cannot find module"

**Solution:** Dependencies not installed.
```
cd "ft"
npm install
cd print-server
npm install
```

### Problem: iPad can't connect

**Solutions:**
- Make sure laptop and iPad on **same WiFi**
- Check laptop firewall (might be blocking port 3000 and 3001)
- Try accessing from laptop first: `http://localhost:3000`

### Problem: Printer doesn't print

**Solutions:**
- Check printer is ON and has paper
- Check USB cable is connected
- Verify printer name in `.env` file matches EXACTLY
- Test with: `http://localhost:3001/health`

---

## 📝 Quick Checklist

- [ ] Node.js installed
- [ ] Project files copied
- [ ] `npm install` done (main project)
- [ ] `npm install` done (print-server)
- [ ] Printer connected via USB
- [ ] Printer name configured in `.env`
- [ ] Laptop IP address found
- [ ] Print server URL updated in `printServer.js`
- [ ] Desktop shortcut created
- [ ] System tested on laptop
- [ ] System tested on iPad

---

## 🆘 Need Help?

If you get stuck, check:
1. Is Node.js installed? (`node --version`)
2. Are you in the correct folder?
3. Did you run `npm install` in BOTH folders?
4. Is the printer name exactly correct?

**Common mistake:** Forgetting to update the IP address in `printServer.js`!

---

**Setup Time:** 15-30 minutes
**Last Updated:** November 2025

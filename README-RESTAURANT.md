# 🍽️ Tamarmyay Restaurant POS System

A modern Point-of-Sale system for restaurants with iPad interface and thermal receipt printing.

---

## 🚀 Quick Start (Daily Use)

### For Cashier

1. **Turn on laptop** (the print server)
2. **Turn on printer** (XP-58 thermal printer)
3. **Double-click**: `Start Restaurant POS` (Desktop shortcut)
4. **Wait 10 seconds** - system starts automatically
5. **On iPad**: Open Safari → Go to address shown on laptop screen
6. **Start taking orders!**

📖 **Detailed Guide:** See [CASHIER-GUIDE.md](CASHIER-GUIDE.md)

---

## 💻 Setup on New Laptop

Need to move to a different laptop?

### Step-by-Step Guides:

1. **[SETUP-NEW-LAPTOP.md](SETUP-NEW-LAPTOP.md)** 
   - Complete guide with screenshots
   - Time: 15-30 minutes
   
2. **[SETUP-CHECKLIST.txt](SETUP-CHECKLIST.txt)** 
   - Quick checklist to print and follow
   - Check off each step as you go

### What You Need:

- Windows laptop
- USB thermal printer (XP-58)
- Node.js installed
- Same WiFi network for iPad and laptop

---

## 📁 Important Files

### Batch Scripts (Double-click to run)

| File | Purpose |
|------|---------|
| `START-RESTAURANT-POS.bat` | Start the entire system |
| `STOP-RESTAURANT-POS.bat` | Stop all services |
| `CREATE-DESKTOP-SHORTCUT.bat` | Create desktop shortcut |

### Configuration Files

| File | What to Change |
|------|---------------|
| `print-server/.env` | Printer name |
| `src/config/printServer.js` | Laptop IP address |

---

## 🖨️ How Printing Works

```
┌─────────┐        WiFi         ┌──────────┐       USB        ┌─────────┐
│  iPad   │ ─────────────────→  │  Laptop  │ ──────────────→  │ Printer │
│ Safari  │  http://192.x.x:3000│  Server  │  Print Commands  │  XP-58  │
└─────────┘                      └──────────┘                  └─────────┘
```

- **iPad**: Runs the POS interface in Safari browser
- **Laptop**: Runs print server (converts orders to printer commands)
- **Printer**: XP-58 thermal printer connected via USB

**Key Point:** Both iPad and laptop must be on the same WiFi network!

---

## 🛠️ Project Structure

```
ft/
├── START-RESTAURANT-POS.bat     # Main startup (CASHIER USES THIS!)
├── STOP-RESTAURANT-POS.bat      # Stop system
├── CREATE-DESKTOP-SHORTCUT.bat  # Create shortcut
├── CASHIER-GUIDE.md            # Guide for daily use
├── SETUP-NEW-LAPTOP.md         # Setup on new laptop
├── 
├── src/                        # React frontend code
│   ├── components/            # UI components
│   ├── config/               # Configuration
│   │   └── printServer.js   # ⚙️ UPDATE IP HERE
│   └── utils/               # Helper functions
│
├── print-server/              # Print server
│   ├── server.js            # Print server code
│   ├── .env                 # ⚙️ UPDATE PRINTER NAME HERE
│   └── package.json         # Dependencies
│
└── public/                   # Static files
```

---

## ⚙️ Configuration

### When Moving to New Laptop:

#### 1. Update Printer Name

File: `print-server/.env`
```env
WINDOWS_PRINTER_NAME=XP-58 (copy 1)
```

Find your printer name:
```cmd
wmic printer get name
```

#### 2. Update Laptop IP Address

File: `src/config/printServer.js`
```javascript
DEFAULT_URL: 'http://192.168.1.XXX:3001'
```

Find your IP:
```cmd
ipconfig
```
Look for "IPv4 Address"

---

## 🔧 Technical Details

### Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Printing**: ESC/POS commands
- **Architecture**: Local WiFi network (no cloud needed!)

### Ports

- **3000**: POS website (iPad access)
- **3001**: Print server (printer communication)

### Dependencies

Main project:
```bash
cd ft
npm install
```

Print server:
```bash
cd print-server
npm install
```

---

## ❓ Troubleshooting

### iPad Can't Connect

- ✅ Check iPad and laptop on same WiFi
- ✅ Check IP address is correct
- ✅ Make sure system is started (green terminal windows)

### Printer Doesn't Print

- ✅ Check printer is ON
- ✅ Check USB cable connected
- ✅ Check printer name in `.env` file
- ✅ Test with: `http://localhost:3001/health`

### System Won't Start

- ✅ Close all windows
- ✅ Run `STOP-RESTAURANT-POS.bat` first
- ✅ Wait 5 seconds
- ✅ Run `START-RESTAURANT-POS.bat` again

---

## 📞 Support

For technical issues, check:
1. Is Node.js installed? (`node --version`)
2. Are both terminals running?
3. Is printer connected and ON?
4. Is WiFi working?

---

## 📝 Version Info

- **Version**: 1.0
- **Last Updated**: November 2025
- **Compatible with**: Windows 10/11, iPad Safari

---

## 🎯 System Requirements

### Laptop (Print Server)
- Windows 10 or 11
- Node.js v16 or higher
- USB port for printer
- WiFi connection

### iPad (Cashier)
- iPad with Safari browser
- iOS 12 or higher
- WiFi connection (same network as laptop)

### Printer
- XP-58 thermal receipt printer
- USB connection
- 58mm thermal paper

---

**Made with ❤️ for Tamarmyay Restaurant**

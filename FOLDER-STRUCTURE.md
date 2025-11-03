# 📁 Folder Structure - Clean and Organized

## 🎯 Essential Files (What You Need)

### ⚡ Startup/Stop Scripts
```
START-POS-SYSTEM.bat          ← Double-click to start everything
STOP-POS-SYSTEM.bat           ← Double-click to stop
CREATE-DESKTOP-SHORTCUT.bat   ← Creates desktop shortcut (run once)
```

### 📚 Documentation
```
README.md                     ← Main documentation (read this first!)
CASHIER-GUIDE.md             ← Daily use guide for cashier
SETUP-NEW-LAPTOP.md          ← How to setup on new laptop
SETUP-CHECKLIST.txt          ← Quick checklist (printable)
```

### ⚙️ Configuration Files
```
.env                         ← Environment variables
package.json                 ← Dependencies
print-server/               ← Print server folder
  └── server.js            ← Print server code
  └── .env                 ← Printer configuration
src/                        ← React source code
  └── config/
      └── printServer.js   ← Laptop IP configuration
```

---

## 🗂️ Complete Structure

```
ft/
│
├── 🚀 START-POS-SYSTEM.bat           # Main startup
├── 🛑 STOP-POS-SYSTEM.bat            # Stop everything
├── ⚙️ CREATE-DESKTOP-SHORTCUT.bat    # Create shortcut
│
├── 📖 README.md                      # Main documentation
├── 👤 CASHIER-GUIDE.md               # For daily use
├── 💻 SETUP-NEW-LAPTOP.md            # New laptop setup
├── ✅ SETUP-CHECKLIST.txt            # Quick checklist
│
├── 📦 package.json                   # Dependencies
├── 🔒 .env                           # Environment config
├── 📝 .gitignore                     # Git ignore rules
│
├── 📁 src/                           # React source code
│   ├── components/                  # UI components
│   ├── config/                      # Configuration
│   │   └── printServer.js          # ⚙️ Laptop IP
│   ├── contexts/                    # React contexts
│   ├── pages/                       # Page components
│   └── utils/                       # Utilities
│
├── 📁 print-server/                  # Print server
│   ├── server.js                    # Print logic
│   ├── .env                         # ⚙️ Printer name
│   └── package.json                 # Dependencies
│
├── 📁 public/                        # Static files
│   ├── index.html
│   └── manifest.json
│
├── 📁 build/                         # Production build
└── 📁 node_modules/                  # Dependencies (auto-generated)
```

---

## 🎯 Files You'll Modify

Only **2 files** need changes when moving to new laptop:

1. **`print-server/.env`**
   ```env
   WINDOWS_PRINTER_NAME=XP-58 (copy 1)
   ```
   Change to your printer name

2. **`src/config/printServer.js`**
   ```javascript
   DEFAULT_URL: 'http://192.168.1.XXX:3001'
   ```
   Change to your laptop IP

---

## 🧹 Cleaned Up!

### ✅ Removed (Outdated):
- ❌ ANDROID-TABLET-SETUP.md
- ❌ BLUETOOTH-PRINTER-GUIDE.md
- ❌ IPAD-LAPTOP-PRINT-SERVER-SETUP.md
- ❌ PRODUCTION-DEPLOYMENT.md
- ❌ SETUP-COMPLETE.md
- ❌ bluetooth-print-test.html
- ❌ bluetooth-test.html
- ❌ temp-backup.html
- ❌ install-print-server.bat
- ❌ start-pos-system.bat
- ❌ start-print-server.bat
- ❌ start-tablet-mode.bat

### ✅ Kept (Essential):
- ✅ START-POS-SYSTEM.bat (main startup)
- ✅ STOP-POS-SYSTEM.bat (stop)
- ✅ CREATE-DESKTOP-SHORTCUT.bat (shortcut creator)
- ✅ README.md (main docs)
- ✅ CASHIER-GUIDE.md (daily use)
- ✅ SETUP-NEW-LAPTOP.md (setup guide)
- ✅ SETUP-CHECKLIST.txt (checklist)

---

## 🚀 Quick Start

1. **First Time**: Run `CREATE-DESKTOP-SHORTCUT.bat`
2. **Daily Use**: Double-click Desktop shortcut
3. **Stop System**: Run `STOP-POS-SYSTEM.bat`

That's it! Simple and clean! 🎉

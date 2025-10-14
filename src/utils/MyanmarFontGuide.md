## Myanmar Font Installation Guide for Thermal Printers

### Method 1: ESC/POS Font Download
1. Check if your Xprinter supports downloadable fonts
2. Create Myanmar font bitmap in ESC/POS format
3. Download font to printer memory using ESC/POS commands

### Method 2: Firmware Update
1. Contact Xprinter support for Myanmar Unicode firmware
2. Check model XP-58IIH for firmware updates
3. Flash updated firmware if available

### Method 3: Driver-Level Solution
1. Install Xprinter Windows driver
2. Configure driver for Unicode support
3. Print through driver instead of direct Bluetooth

### Commands to Try:
```
ESC ( t 03 00 01 10 00  // Select character code table
ESC ( C 02 00 FF FF     // Select user-defined character set
GS ( N 01 00 31         // Enable NV graphics
```

Note: These may not work if hardware doesn't support it.

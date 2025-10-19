import React, { createContext, useContext, useEffect, useState } from 'react';
import BluetoothThermalPrinter from '../utils/BluetoothThermalPrinter';
import PrintServerClient from '../utils/PrintServerClient';

const PrinterContext = createContext();

export function PrinterProvider({ children }) {
  const [printer, setPrinter] = useState(null);
  const [printServer, setPrintServer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [printServerAvailable, setPrintServerAvailable] = useState(false);
  const [preferredMethod, setPreferredMethod] = useState('auto'); // 'bluetooth', 'server', 'auto'

  // Initialize printer instances with PWA enhancements
  useEffect(() => {
    const printerInstance = new BluetoothThermalPrinter();
    const printServerInstance = new PrintServerClient();
    
    setPrinter(printerInstance);
    setPrintServer(printServerInstance);

    // Check print server availability on startup
    printServerInstance.checkAvailability().then(available => {
      setPrintServerAvailable(available);
      if (available) {
        console.log('✅ Laptop print server detected - iPad can use laptop as print bridge');
      } else {
        console.log('ℹ️  No print server detected - will use direct Bluetooth only');
      }
    });

    // PWA-specific enhancements for better printer connectivity
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('🚀 PWA mode detected - Enhanced printer connectivity enabled');
      
      // Better connection persistence in PWA mode
      const handleVisibilityChange = () => {
        if (!document.hidden && printerInstance) {
          // Re-check connection when app becomes visible (iPad switching between apps)
          setTimeout(() => {
            const stillConnected = printerInstance.checkConnection();
            setIsConnected(stillConnected);
            setConnectionStatus(stillConnected ? 'connected' : 'disconnected');
          }, 1000);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  // Connect to printer
  const connectPrinter = async () => {
    if (!printer) return false;
    
    try {
      setConnectionStatus('connecting');
      
      // Check if already connected
      if (printer.checkConnection()) {
        setIsConnected(true);
        setConnectionStatus('connected');
        return true;
      }

      await printer.connect();
      setIsConnected(true);
      setConnectionStatus('connected');
      
      console.log('✅ Printer connected globally - will persist for entire session');
      return true;
    } catch (error) {
      console.error('❌ Global printer connection failed:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      throw error;
    }
  };

  // Disconnect printer
  const disconnectPrinter = async () => {
    if (!printer) return;
    
    try {
      await printer.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
      console.log('📡 Printer disconnected globally');
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
    }
  };

  // Print receipt with smart method selection
  const printReceipt = async (receiptData) => {
    console.log('🖨️  Starting smart print process...');
    
    // Method 1: Try laptop print server first (most reliable for iPad + USB printer)
    if (printServer && (preferredMethod === 'server' || preferredMethod === 'auto')) {
      try {
        console.log('🖥️  Attempting to print via laptop print server...');
        const serverAvailable = await printServer.checkAvailability();
        
        if (serverAvailable) {
          const result = await printServer.printReceipt(receiptData);
          console.log('✅ Successfully printed via laptop print server!');
          return result;
        }
      } catch (serverError) {
        console.warn('⚠️  Laptop print server failed:', serverError.message);
        
        if (preferredMethod === 'server') {
          throw new Error(`Print server failed: ${serverError.message}. Make sure your laptop is running the print server.`);
        }
        // Continue to Bluetooth if auto mode
      }
    }

    // Method 2: Try direct Bluetooth connection (fallback)
    if (printer && (preferredMethod === 'bluetooth' || preferredMethod === 'auto')) {
      try {
        console.log('📱 Attempting direct Bluetooth printing...');
        
        // Auto-connect if not connected
        if (!isConnected || !printer.checkConnection()) {
          console.log('🔄 Printer not connected, attempting to connect...');
          await connectPrinter();
        }

        const result = await printer.print(receiptData);
        console.log('✅ Successfully printed via Bluetooth!');
        return result;
      } catch (bluetoothError) {
        console.warn('⚠️  Bluetooth printing failed:', bluetoothError.message);
        
        if (preferredMethod === 'bluetooth') {
          throw bluetoothError;
        }
        // If we're in auto mode and both failed, throw combined error
        const serverMsg = printServerAvailable ? 'Failed' : 'Not available';
        throw new Error(`All printing methods failed. Laptop server: ${serverMsg}. Bluetooth: ${bluetoothError.message}`);
      }
    }

    throw new Error('No printing methods available');
  };

  // Set preferred printing method
  const setPrintingMethod = (method) => {
    setPreferredMethod(method);
    console.log(`🔧 Printing method set to: ${method}`);
  };

  // Check print server status
  const checkPrintServer = async () => {
    if (!printServer) return false;
    
    try {
      const available = await printServer.checkAvailability();
      setPrintServerAvailable(available);
      return available;
    } catch (error) {
      setPrintServerAvailable(false);
      return false;
    }
  };

  // Check connection status
  const checkConnection = () => {
    if (!printer) return false;
    const connected = printer.checkConnection();
    
    // Update state if it changed
    if (connected !== isConnected) {
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    }
    
    return connected;
  };

  const value = {
    printer,
    printServer,
    isConnected,
    connectionStatus,
    printServerAvailable,
    preferredMethod,
    connectPrinter,
    disconnectPrinter,
    printReceipt,
    checkConnection,
    checkPrintServer,
    setPrintingMethod
  };

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  const context = useContext(PrinterContext);
  if (context === undefined) {
    throw new Error('usePrinter must be used within a PrinterProvider');
  }
  return context;
}

export default PrinterContext;

import React, { createContext, useContext, useEffect, useState } from 'react';
import BluetoothThermalPrinter from '../utils/BluetoothThermalPrinter';

const PrinterContext = createContext();

export function PrinterProvider({ children }) {
  const [printer, setPrinter] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error

  // Initialize printer instance once with PWA enhancements
  useEffect(() => {
    const printerInstance = new BluetoothThermalPrinter();
    setPrinter(printerInstance);

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

  // Print receipt
  const printReceipt = async (receiptData) => {
    if (!printer) {
      throw new Error('Printer not initialized');
    }

    // Auto-connect if not connected
    if (!isConnected || !printer.checkConnection()) {
      console.log('🔄 Printer not connected, attempting to connect...');
      await connectPrinter();
    }

    return await printer.print(receiptData);
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
    isConnected,
    connectionStatus,
    connectPrinter,
    disconnectPrinter,
    printReceipt,
    checkConnection
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

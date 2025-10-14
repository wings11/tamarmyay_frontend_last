import React, { useState, useEffect } from 'react';

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator.standalone === true);
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('💾 PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA has been installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS Safari - show manual install instructions
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        alert('📱 To install on iPad:\n\n1. Tap the Share button (⬆️)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install\n\nThis will give you direct Xprinter access!');
        return;
      }
      return;
    }

    const result = await deferredPrompt.prompt();
    console.log('👤 User response to install prompt:', result);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show if already installed
  if (isInstalled) {
    return (
      <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-xs sm:text-sm mb-4">
        <p className="font-semibold text-green-800">✅ PWA Installed!</p>
        <p className="text-green-700">
          Enhanced printer connectivity active. Direct Xprinter access available.
        </p>
      </div>
    );
  }

  // Don't show if prompt not available
  if (!showInstallPrompt && !(/iPad|iPhone|iPod/.test(navigator.userAgent))) {
    return null;
  }

  return (
    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs sm:text-sm mb-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-blue-800">📱 Install as App</p>
          <p className="text-blue-700">
            Better iPad printing & offline access
          </p>
        </div>
        <div className="flex gap-2 ml-3">
          <button
            onClick={handleInstallClick}
            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
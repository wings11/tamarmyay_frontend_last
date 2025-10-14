// Service Worker for Tamarmyay PWA
// Enables offline functionality and better printer connection management

const CACHE_NAME = 'tamarmyay-pos-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 PWA Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app resources for offline use');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('⚠️ Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ PWA Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and external APIs
  if (event.request.method !== 'GET' || 
      event.request.url.includes('tamarmyaybackend') ||
      event.request.url.includes('api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('📱 Serving from cache:', event.request.url);
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for printer operations (when supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'printer-sync') {
    console.log('🖨️ Background printer sync triggered');
    // Handle any pending print jobs
    event.waitUntil(handlePrinterSync());
  }
});

async function handlePrinterSync() {
  try {
    // Check if there are any pending print jobs in IndexedDB
    // This would integrate with your printer context
    console.log('🔄 Processing background print jobs...');
    
    // Implementation would depend on your specific needs
    // For now, just log that the sync is working
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Background sync failed:', error);
    throw error;
  }
}

// Handle printer connection events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRINTER_STATUS') {
    console.log('🖨️ Printer status update:', event.data.status);
    
    // Broadcast to all clients
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'PRINTER_STATUS_UPDATE',
          status: event.data.status
        });
      });
    });
  }
});

console.log('🚀 Tamarmyay PWA Service Worker loaded successfully');
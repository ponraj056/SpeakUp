const CACHE_NAME = 'speakup-offline-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
});

// Listen for the "SYNC_OFFLINE" message from the client
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SYNC_OFFLINE') {
    const { manifest } = event.data;
    console.log('[SW] Starting full offline sync for', manifest.length, 'URLs');
    
    const cache = await caches.open(CACHE_NAME);
    
    // Download and cache everything in the manifest
    try {
      await cache.addAll(manifest);
      console.log('[SW] Offline sync complete');
      event.ports[0].postMessage({ status: 'success' });
    } catch (error) {
      console.error('[SW] Offline sync failed:', error);
      event.ports[0].postMessage({ status: 'error', error: error.message });
    }
  }
});

// Fetch with cache fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

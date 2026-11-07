const CACHE_NAME = 'walkie-talkie-v10.1';
const ASSETS_TO_CACHE = [
  './index.html',
  'https://unpkg.com/mqtt/dist/mqtt.min.js'
];

// 安裝 Service Worker 並快取核心資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
}));

// 啟動並清理舊版本快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求，優先使用快取或回退到網絡
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // 如果離線且請求的是主頁，可以返回快取的 index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
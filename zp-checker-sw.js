const CACHE_NAME = 'zp-checker-cache-v1'
const urlsToCache = [
	'/', // головна сторінка
	'/index.html', // HTML
	'/style-light.css', // CSS
	'/main.js', // JS
	'/app.js', // JS
]

// Встановлення SW і кешування ресурсів
self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// Перехоплення запитів
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// Якщо є в кеші — повертаємо
			if (response) return response
			// Інакше робимо запит і додаємо в кеш
			return fetch(event.request).then((res) => {
				return caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, res.clone())
					return res
				})
			})
		}),
	)
})

// У activate події видаляємо старі кеші
self.addEventListener('activate', (event) => {
	const cacheWhitelist = [CACHE_NAME]
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key) => {
					if (!cacheWhitelist.includes(key)) {
						return caches.delete(key)
					}
				}),
			),
		),
	)
})

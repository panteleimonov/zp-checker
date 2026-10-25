const CACHE_NAME = 'zpch-cache-v2026.10.25f'
const urlsToCache = [
	'./', // головна сторінка
	'./index.html', // HTML
	'./style-light.css', // CSS
	'./main.js', // JS
	'./app.js', // JS
]

// Встановлення SW і кешування ресурсів
self.addEventListener('install', (event) => {
	self.skipWaiting()
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// Перехоплення запитів
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url)

	// Кешування Google Fonts
	if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
		event.respondWith(
			caches.open('google-fonts').then((cache) =>
				fetch(event.request)
					.then((response) => {
						cache.put(event.request, response.clone())
						return response
					})
					.catch(() => caches.match(event.request)),
			),
		)
		return
	}

	// Стандартна стратегія для локальних файлів
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
	event.waitUntil(
		Promise.all([
			self.clients.claim(),

			caches.keys().then((keys) =>
				Promise.all(
					keys.map((key) => {
						if (key !== CACHE_NAME && key !== 'google-fonts') {
							return caches.delete(key)
						}
					}),
				),
			),
		]),
	)
})

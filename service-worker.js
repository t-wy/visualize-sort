this.addEventListener('install', function(event) {
    this.skipWaiting();
    event.waitUntil(
        caches.open('app').then(function (cache) {
            return cache.addAll([
                "./", // cache itself also
                "index.html",
                "style.css",
                "random.js",
                "utilities.js",
                "polyfill.js",
                "code.js",
                "code_processor.js",
                "prolang.js",
                "main.js",
                /* "service-worker.js", */
                "manifest.json",
                "icon.png",
                "icon32.png",
                "icon192.png",
                "icon512.png",
                "icon_apple.png",
            ])
        })
    );
});
this.addEventListener('fetch', function(event) {
    event.respondWith(
        // preferred downloading whenever internet is available
        fetch(event.request).then(
            async function (response) {
                const cache = await caches.open('app');
                cache.put(event.request, response.clone());
                return response;
            }
        ).catch(
            function() {
                // find in cache
                return caches.match(event.request);
            }
        )
    );
});
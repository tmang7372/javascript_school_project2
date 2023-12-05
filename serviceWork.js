var cache_version_1 = "version_1";
self.addEventListener("install", function(event){
    console.log("service worker installing");
    event.waitUntil(
     caches.open(cache_version_1).then(function(cache){
         return cache.addAll(						[
         "/index.html",
         ]
             );
         })
         .then(self.skipWaiting())
     );
 });

 self.addEventListener("activate", function(event){
    event.waitUntil(
     caches.keys()
     .then(function (keys) {
        return Promise.all(			
            keys.filter(function (key) {
            return !key.startsWith(cache_version_1);  
         })
         .map(function (key) { 
           return caches.delete(key);
         })
     );
    })
 )});

 self.addEventListener("fetch", function(event){
    event.respondWith(
     caches.match(event.request).then(function(response){
        return response || fetch(event.request);		})
    );
 });


self.addEventListener('push', function(event) {
	var notificationText = "You Got New Message!";
	if(event.data){
        notificationText = event.data.text();
	}

	const title = 'Message';
	const options = {
		body: notificationText,
		icon: './images/icons/icon-128x128.png',
		badge: './images/icons/icon-128x128.png'
	};

	event.waitUntil(self.registration.showNotification(title, options));
});


self.addEventListener('notificationclick', function(event) { //What happens when clicked on Notification
	console.log('[Service Worker] Notification click Received.');
    event.notification.close();

	event.waitUntil(
		clients.openWindow("http://127.0.0.1:8887")
	);
});




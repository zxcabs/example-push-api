/**
 * @author "Evgeny Reznichenko" <kusakyky@gmail.com>
 */

var
    apiUrl = 'http://localhost/api/getMessage';


self.addEventListener('push', function(event) {
    event.waitUntil(
        fetch(apiUrl)
            .then(function (response) {
                if (response.status !== 200) throw Error('response error');

                return response.json().then(function (data) {
                    if (data.type === 'msg-text') {
                        return self.registration.showNotification('Новое сообщение в чате:', {
                            body: data.text,
                            icon: '/icon.png'
                        })
                    }
                });
            })
            .catch(function (err) {
                console.error(err);
            })
    );
});

self.addEventListener('notificationclick', function (ev) {
    ev.notification.close();

    ev.waitUntil(
        clients.matchAll({
            type: 'window'
        })
        .then(function (clients) {
            for (var i = 0; i < clients.length; i += 1) {
                var client = clients[i];

                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                clients.openWindow('/');
            }
        })
    );
});

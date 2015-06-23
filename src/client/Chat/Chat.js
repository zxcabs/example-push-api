/**
 * @author "Evgeny Reznichenko" <kusakyky@gmail.com>
 */

import style from './Chat.css';
import io from 'socket.io-client';

const consts = require('../../consts');

const KEY_CODE_ENTER = 13;

export default class Chat {
    constructor(rootId = 'root') {
        this.isSubscribe = false;

        this.rootEl = document.getElementById(rootId);

        this.socket = io('http://localhost/');
        this.socket.on('connect', this.onSocketConnect.bind(this));
        this.socket.on(consts.CHANNEL, this.onSocketMessage.bind(this));
        this.socket.on('disconnect', this.onSocketDisconnect.bind(this));

        this.rootEl.appendChild(this._buildNode(this.chatTemplate()));
        this.messagesEl = this.rootEl.querySelector(`.messages`);
        this.newMessageEl = this.rootEl.querySelector(`.newMessage`);
        this.sendButtonEl = this.rootEl.querySelector(`.sendButton`);
        this.subscribeButton = this.rootEl.querySelector(`.subscribeButton`);

        this.sendButtonEl.addEventListener('click', this.onSendButtonClick.bind(this));
        this.newMessageEl.addEventListener('keyup', this.onNewMessageKeyup.bind(this));
        this.subscribeButton.addEventListener('click', this.onSubscribeButtonClick.bind(this));

        navigator.serviceWorker.ready
            .then((serviceWorkerRegistration) => {
                return serviceWorkerRegistration.pushManager.getSubscription()
                    .then((pushSubscription) => {
                        let
                            isSubscribe = !!pushSubscription;

                        this.isSubscribe = isSubscribe;
                        this.subscribeButton.innerText = isSubscribe ? 'Unsubscribe': 'Subscribe';
                    })
            });
    }

    chatTemplate() {
        return `<div class="${ style.root }">
                    <div class="messages ${ style.messages }"></div>
                    <div class="${ style.control }">
                        <input class="newMessage ${ style.newMessage }"/>
                        <button class="sendButton ${ style.sendButton }">Send</button>
                        <button class="subscribeButton ${ style.subscribeButton }">Subscribe</button>
                    </div>
                </div>`;
    }

    messageTemplate(message) {
        return `<div class="${ style.message } ${ style[message.type] }">
                    <div class="${ style.messageTime }">${ (new Date(message.time)).toLocaleTimeString() }</div>
                    <div class="${ style.messageAuthor }">${ message.author }:</div>
                    <div class="${ style.messageText }">${ message.text }</div>
                </div>`;
    }

    onNewMessageKeyup(ev) {
        if (ev.keyCode === KEY_CODE_ENTER) {
            this.processMessage();
        }
    }


    onSendButtonClick() {
        this.processMessage();
    }

    onSubscribeButtonClick() {
        if (this.isSubscribe) {
            this.unsubscribe();
        } else {
            this.subscribe();
        }
    }

    subscribe() {
        navigator.serviceWorker.register('/worker6.js')
            .then(() => {
                return navigator.serviceWorker.ready
                    .then((serviceWorkerRegistration) => {
                        return serviceWorkerRegistration.pushManager.subscribe();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
            .then((subscription) => {
                this.isSubscribe = true;
                this.subscribeButton.innerText = 'Unsubscribe';

                this.socket.send({ type: consts.MSG_SUBSCRIBE, subscription: subscription });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    unsubscribe() {
        navigator.serviceWorker.ready
            .then((serviceWorkerRegistration) => {
                return serviceWorkerRegistration.pushManager.getSubscription()
                    .then((pushSubscription) => {
                        if (!pushSubscription) {
                            this.isSubscribe = false;
                            this.subscribeButton.innerText = 'Subscribe';
                            this.socket.send({ type: consts.MSG_NOTSUBSCRIBE });
                            return;
                        }

                        let
                            subscriptionId = pushSubscription.subscriptionId;

                        return pushSubscription.unsubscribe()
                            .then(() => {
                                this.isSubscribe = false;
                                this.subscribeButton.innerText = 'Subscribe';
                                this.socket.send({ type: consts.MSG_UNSUBSCRIBE, subscriptionId: subscriptionId });
                                return serviceWorkerRegistration.unregister().then((isUnregistered) => {
                                    console.log(isUnregistered);
                                });
                            })
                            .catch((e) => {
                                console.log('Unsubscription error: ', e);
                                this.isSubscribe = false;
                                this.subscribeButton.innerText = 'Subscribe';
                                this.socket.send({ type: consts.MSG_UNSUBSCRIBE, subscriptionId: subscriptionId });
                            });
                }).catch(function(e) {
                    console.error('Error thrown while unsubscribing from push messaging.', e);
                });
            });
    }

    onSocketConnect() {
        this.selfMessage('connected');
    }

    onSocketDisconnect() {
        this.selfMessage('disconnected');
    }

    onSocketMessage(msg) {
        this.addMessage(msg);
    }

    processMessage() {
        const
            newMessageText = (this.newMessageEl.value || '').trim();

        this.newMessageEl.value = '';

        if (!newMessageText) return;

        this.socket.send({ type: consts.MSG_TEXT, text: newMessageText });
    }

    selfMessage(text) {
        this.addMessage({
            time: Date.now(),
            author: consts.SYSTEM_USER_ID,
            text: text
        });
    }

    addMessage(message) {
        this.messagesEl.appendChild(this._buildNode(this.messageTemplate(message)));
    }

    _buildNode(html) {
        const
            buff = document.createElement('DIV');

        buff.innerHTML = html;

        return buff.childNodes[0];
    }
}

/**
 * @author "Evgeny Reznichenko" <kusakyky@gmail.com>
 */
import Chat from './Chat/Chat.js';
//
//let
//    manifestEl = document.createElement('LINK');
//
//manifestEl.setAttribute('rel', 'manifest');
//manifestEl.setAttribute('href', require('!!file!./chatmanifest.json'));
//document.head.appendChild(manifestEl);

window.onload = function () {
    const chat = new Chat('root');
};

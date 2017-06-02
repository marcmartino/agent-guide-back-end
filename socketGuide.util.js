const WebSocket = require('ws');

function evNames(id) {
    return {
        emitMessage: `emit-message-${id}`,
        connectedEndUser: `connect-end-user-${id}`,
        disconnectedEndUser: `disconnect-end-user-${id}`,
        connectedAdmin: `connect-admin-${id}`,
        disconnectedAdmin: `disconnect-admin-${id}`,

    }
}
function listenAndSend(emitter, sock, id, evListObj = {}) {
    // listenerObj = {evName, sendMessage}
    emitter.on(evListObj.evName, ((sock, id, sendMessage) => (eventData) => {
        if (sock.readyState === WebSocket.OPEN) {
            sock.send(templateMessage(sendMessage, id, eventData));
        }
    })(sock, id, evListObj.sendMessage));
}

function templateMessage(mess, id, eventData) {
    return mess.toString() + " " + id + " " + eventData;
}

module.exports = {evNames, listenAndSend};
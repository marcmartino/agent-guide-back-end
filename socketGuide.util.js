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
    emitter.removeAllListeners(evListObj.evName);
    emitter.on(evListObj.evName, ((sock, id, evName, sendMessage) => (eventData) => {
        if (sock.readyState === WebSocket.OPEN) {
            sock.send(JSON.stringify({
                uId: id,
                event: evName,
                text: templateMessage(sendMessage, id, eventData)
            }));
        }
    })(sock, id, evListObj.evName, evListObj.sendMessage));
}

function templateMessage(mess, id, eventData) {
    return mess.toString() + " " + id + " " + eventData;
}

module.exports = {evNames, listenAndSend};
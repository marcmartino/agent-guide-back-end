const WebSocket = require('ws');
const sockUtils = require('./socketGuide.util.js');
const EventEmitter = require('events');

const sockEmitter = new EventEmitter;

const endUserSocketServer = new WebSocket.Server({ port: 8101 });
const adminSocketServer = new WebSocket.Server({ port: 8102 });

adminSocketServer.on('connection', function connection(adminSock, req) {
    adminSock.on('message', function incoming(message) {
        const statusObj = JSON.parse(message);
        // { endUserIds: [7122972481],
        //   directive: "http://site.com/page" }
        statusObj.endUserIds.forEach((euId) => {
            establishEUConnectDisconnectELs(adminSock, euId);

            sockEmitter.emit(sockUtils.evNames(euId).connectedAdmin, euId);

            //TODO: listenerCount won't work here anymore
            if (sockEmitter.listenerCount(sockUtils.evNames(euId).connectedAdmin)) {
                sockEmitter.emit(sockUtils.evNames(euId).connectedEndUser, euId);
            }

            if (statusObj.directive) {
                const emitMessageName = sockUtils.evNames(euId).emitMessage;

                sockEmitter.emit(emitMessageName, statusObj.directive);
                adminSock.send('we got your message m8');
            }

            adminSock.on("close", ((uId) => () => {
                console.log(` on close occurred for admin - ${uId}`);
                sockEmitter.emit(sockUtils.evNames(uId).disconnectedAdmin);
            })(euId));
        });
    });

    adminSock.send('Administrator Connection Confirmed');
});

endUserSocketServer.on('connection', function connection(euSock, req) {
    euSock.on('message', function incoming(message) {
        const statusObj = JSON.parse(message);
        // { status: 'identify',
        //   userId: 7122972481 }
        if (statusObj.status === 'identify') {
            establishAdminConnectDisconnectELs(this, statusObj.userId);
            establishMessageEL(this, statusObj.userId);

            sockEmitter.emit(sockUtils.evNames(statusObj.userId).connectedEndUser,
                statusObj.userId);

            // TODO: listenerCount won't work here anymore
            if (sockEmitter.listenerCount(sockUtils.evNames(statusObj.userId).connectedEndUser)) {
                sockEmitter.emit(sockUtils.evNames(statusObj.userId).connectedAdmin, statusObj.userId);
            }
            euSock.send('identified your sock ' + statusObj.userId);
            euSock.on("close", ((uId) => () => {
                console.log(` on close occurred for ${uId}`);
                sockEmitter.emit(sockUtils.evNames(uId).disconnectedEndUser);
            })(statusObj.userId));
        }
    });

    euSock.send('End User Connection Confirmed');
});

function establishMessageEL(euSock, uId) {
    console.log('establishing emit message listener for ' + uId);
    sockUtils.listenAndSend(sockEmitter, euSock, uId,
        {
            evName: sockUtils.evNames(uId).emitMessage,
            sendMessage: 'message passed'
        });
}

function establishEUConnectDisconnectELs(sock, uId) {
    sockUtils.listenAndSend(sockEmitter, sock, uId,
        {
            evName: sockUtils.evNames(uId).connectedEndUser,
            sendMessage: 'user connected'
        });
    sockUtils.listenAndSend(sockEmitter, sock, uId,
        {
            evName: sockUtils.evNames(uId).disconnectedEndUser,
            sendMessage: 'user disconnected'
        });
}
function establishAdminConnectDisconnectELs(sock, uId) {
    sockUtils.listenAndSend(sockEmitter, sock, uId,
        {
            evName: sockUtils.evNames(uId).connectedAdmin,
            sendMessage: 'user connected'
        });
    sockUtils.listenAndSend(sockEmitter, sock, uId,
        {
            evName: sockUtils.evNames(uId).disconnectedAdmin,
            sendMessage: 'user disconnected'
        });
}

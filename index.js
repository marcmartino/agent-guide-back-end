const WebSocket = require('ws');
const sockUtils = require('./socketGuide.util.js');
const EventEmitter = require('events');

const sockEmitter = new EventEmitter;

const endUserSocketServer = new WebSocket.Server({ port: 8101 });
const adminSocketServer = new WebSocket.Server({ port: 8102 });


adminSocketServer.on('connection', function connection(adminSock, req) {
    adminSock.on('message', function incoming(message) {
        const statusObj = JSON.parse(message);
        // { endUserIds: [7022972481],
        //   directive: "http://site.com/page" }
        statusObj.endUserIds.forEach((euId) => {
            console.log(`foreach end user  ${sockUtils.evNames(euId).emitMessage}`);
            const emitMessageName = sockUtils.evNames(euId).emitMessage;

            if (sockEmitter.listenerCount(emitMessageName) > 0) {
                sockEmitter.emit(emitMessageName,
                    statusObj.directive);
                adminSock.send('we got your message m8');
            } else {
                adminSock.send(`no end user ${euId} listening`);
            }
        });
    });

    adminSock.send('Administrator Connection Confirmed');
});

endUserSocketServer.on('connection', function connection(euSock, req) {
    euSock.on('message', function incoming(message) {
        const statusObj = JSON.parse(message);
        // { status: 'identify',
        //   userId: 7022972481 }
        if (statusObj.status === 'identify') {
            removeMessageEL(statusObj.userId);
            establishMessageEL(this, statusObj.userId);

            sockEmitter.emit(sockUtils.evNames(statusObj.userId).connectEndUser,
                statusObj.userId);

            euSock.send('identified your sock ' + statusObj.userId);
            euSock.on("close", ((uId) => () => {
                console.log(` on close occurred for ${uId}`);
                removeMessageEL(uId);
                sockEmitter.emit(sockUtils.evNames(uId).disconnectEndUser);
            })(statusObj.userId));
        }
    });



    euSock.send('End User Connection Confirmed');
})

function removeMessageEL(uId) {
    console.log(`removing message listener for ${uId}`);
    sockEmitter.removeAllListeners(sockUtils.evNames(uId).emitMessage);
}
function establishMessageEL(euSock, uId) {
    console.log('establishing emit message listener for ' + uId);
    const evNames = sockUtils.evNames(uId);
    sockEmitter.on(evNames.emitMessage, (directive) => {
        euSock.send(directive);
    });
}




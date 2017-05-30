function evNames(id) {
    return {
        emitMessage: `emit-message-${id}`,
        connectEndUser: `connect-end-user-${id}`,
        disconnectEndUser: `disconnect-end-user-${id}`,
    }
}

module.exports = {evNames};
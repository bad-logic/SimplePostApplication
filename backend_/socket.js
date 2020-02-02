const { socket } = require('./config');
let io;

module.exports = {
    init: httpServer => {
        io = socket(httpServer);
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('socket connection not initialised');
        }
        return io;
    }
}
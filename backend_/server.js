const { app } = require('./app');
const { HOST, PORT } = require('./config');
const { connect } = require('./config/db');
const { init } = require('./socket');

connect((err, done) => {

    if (err) {
        console.log("error connecting to the database");
    } else {
        console.log("connected to the database");
        const server = app.listen(PORT, HOST);
        if (server) {
            console.log(`server started at ${HOST}:${PORT}`);
            const io = init(server);
            io.on('connection', socket => {
                console.log("client connected!!");
            });
        } else {
            console.log("server couldnot be started!!!");
        }
    }

});
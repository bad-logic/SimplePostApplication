const { app } = require('./app');
const { HOST, PORT } = require('./config');
const { connect } = require('./config/db');

connect((err, done) => {

    if (err) {
        console.log("error connecting to the database");
    } else {
        console.log("connected to the database");
        app.listen(PORT, HOST, (err, connect) => {
            if (err) {
                console.log(`server couldnot be started due to >>>${err}`);
            } else {
                console.log(`server started at ${HOST}:${PORT}`);
            }
        });
    }

});
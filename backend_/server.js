const { app } = require('./app');
const { HOST, PORT } = require('./config');


app.listen(PORT, HOST, (err, done) => {
    if (err) {
        console.log("server couldnot be started!!!");
    } else {
        console.log(`server started at ${HOST}:${PORT}`);
    }
})
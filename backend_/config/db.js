const { mongoose, HOST, DB_PORT, DB_NAME } = require('./index');

exports.connect = (cb) => {

    mongoose.connect(`mongodb://${HOST}:${DB_PORT}/${DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, done) => {
        if (err) {
            cb(err);
        } else {
            cb(null, done);
        }
    });

}
const { file, path } = require('./../config');
// TO DELETE THE IMAGE FILE FROM THE SERVER
const clearImage = filePath => {

    filePath = path.join(__dirname, '..', filePath);

    file.unlink(filePath, (err, done) => {
        if (err) {
            console.log("error deleting the file>>", err);
        }
    });

};

module.exports = { clearImage };
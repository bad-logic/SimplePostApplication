const { jwt } = require('./../config');
const User = require('./../models/user.model');


module.exports = (req, res, next) => {

    const authToken = req.get('api_key');

    if (!authToken) {
        const error = new Error('not authenticated');
        error.statusCode = 401;
        throw error;
    }

    const token = authToken.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, User.getJWT().signature_key);
    } catch (err) {
        //  FAILED DUE TO TECHNICAL ERROR
        err.statusCode = 500;
        throw err;
    }
    // WORKED BUT INVALID TOKEN
    if (!decodedToken) {
        const error = new Error('not authenticated');
        error.statusCode = 401;
        throw error;
    }
    // VALID TOKEN

    // HANDLING IF THE USER EXISTS IN DATABASE
    // CASES WHERE USER MAY BE DELETED FROM SYSTEM BUT HAS ACCESS TO VALID TOKEN
    User.findById(decodedToken.userId)
        .then(user => {
            // VALID TOKEN
            if (!user) {
                // USER DELETED/NOT IN THE SYSTEM
                const error = new Error('not authenticated');
                error.statusCode = 401;
                throw error;
            } else {
                // USER EXISTS IN THE SYSTEM
                req.userId = user._id;
                next();
            }
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}
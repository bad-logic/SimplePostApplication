const { jwt } = require('./../config');
const User = require('./../models/user.model');


module.exports = (req, res, next) => {

    const authToken = req.get('api_key');

    if (!authToken) {
        req.isAuth = false;
        return next();
    }

    const token = authToken.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, User.getJWT().signature_key);
    } catch (err) {
        //  FAILED DUE TO TECHNICAL ERROR
        req.isAuth = false;
        return next();
    }
    // WORKED BUT INVALID TOKEN
    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }
    // VALID TOKEN

    // HANDLING IF THE USER EXISTS IN DATABASE
    // CASES WHERE USER MAY BE DELETED FROM SYSTEM BUT HAS ACCESS TO VALID TOKEN
    User.findById(decodedToken.userId)
        .then(user => {
            // VALID TOKEN
            if (!user) {
                // USER DELETED/NOT IN THE SYSTEM
                req.isAuth = false;
                return next();
            } else {
                // USER EXISTS IN THE SYSTEM
                req.isAuth = true;
                req.userId = user._id;
                next();
            }
        })
        .catch(err => {
            req.isAuth = false;
            return next();
        });

}
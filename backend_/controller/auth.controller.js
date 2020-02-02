const User = require('./../models/user.model');
const { validationResult, jwt } = require('./../config');

exports.register = async(req, res, next) => {
    console.log("req body>>", req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    try {
        const done = await newUser.save();
        res.status(201).json({ message: 'user created successfully!!!', userId: done._id });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

exports.login = async(req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }

    try {
        const user = await User.MatchByCredentials(req.body.email, req.body.password);
        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        }, User.getJWT().signature_key, { expiresIn: '1h' });
        res.status(200).json({
            message: 'login successfull',
            token: token,
            userId: user._id.toString()
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}
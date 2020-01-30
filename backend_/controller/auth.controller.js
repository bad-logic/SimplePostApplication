const User = require('./../models/user.model');
const { validationResult } = require('./../config');

exports.register = (req, res, next) => {
    console.log("req body>>", req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    newUser.save()
        .then(done => {
            res.status(201).json({ message: 'user created successfully!!!', userId: done._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}
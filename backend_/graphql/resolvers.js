const User = require('./../models/user.model');
const { validator } = require('./../config');

module.exports = {
    // createUser(args, req) {
    //     const email = args.userInput.email;

    // }
    createUser: async function({ userInput }, req) {

        const errorArray = [];
        if (!validator.isEmail(userInput.email)) {
            errorArray.push({ message: 'E-mail is invalid!!!' });
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
            errorArray.push({ message: 'Password too short!!!' });
        }
        if (validator.isEmpty(userInput.name)) {
            errorArray.push({ message: 'name must provided' });
        }
        if (errorArray.length > 0) {
            const error = new Error('validation failed');
            error.data = errorArray;
            error.statusCode = 422;
            throw error;
        }
        // try {
        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            const error = new Error('User already exists with that Email');
            error.statusCode = 422;
            throw error;
        }

        const newUser = new User({
            name: userInput.name,
            email: userInput.email,
            password: userInput.password
        });
        const createdUser = await newUser.save();
        return {...createdUser._doc, _id: createdUser._id.toString() };
        //     } catch (err) {
        //         if (!err.statusCode) {
        //             err.statusCode = 500;
        //         }
        //         next(err);
        //     }
    }
}
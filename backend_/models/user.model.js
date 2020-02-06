const { mongoose, bcrypt, _ } = require('./../config');
const Schema = mongoose.Schema;
const secretKey = 'lkd45j564%[^%s]l%f@#$%^%$le)wrjd(f$#%{}khgk';

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'I am new!'
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'post'
    }]
}, { timestamps: true });

// *** INSTANCE METHODS ***

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    // return the document except the password and sessions(they should not be made available)
    return _.omit(userObject, 'password');
}

userSchema.pre('save', function(next) {

    const user = this;
    if (user.isModified('password')) {

        bcrypt.hash(user.password, 12).then(hashedPassword => {
            user.password = hashedPassword;
            next();

        });
    } else {

        next();

    }

});

userSchema.statics.getJWT = function() {

    return {
        signature_key: secretKey
    }

}


userSchema.statics.MatchByCredentials = function(email, password) {

    let user = this;
    return new Promise((resolve, reject) => {
        let validUser;
        user.findOne({ email: email })
            .then(data => {
                if (!data) {
                    const error = new Error('no such email exists in our database');
                    error.statusCode = 401;
                    throw error;
                }
                validUser = data;
                return bcrypt.compare(password, data.password);
            })
            .then(doMatch => {
                if (doMatch) {
                    resolve(validUser);
                } else {
                    const error = new Error('password is incorrect');
                    error.statusCode = 401;
                    throw error;
                }
            })
            .catch(err => {
                reject(err);
            });
    });

}


const userModel = mongoose.model('user', userSchema);
module.exports = userModel;
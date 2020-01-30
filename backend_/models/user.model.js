const { mongoose, bcrypt } = require('./../config');
const Schema = mongoose.Schema;

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

userSchema.statics.findByEmail = function(email) {

    let user = this;
    return new Promise((resolve, reject) => {
        user.findOne({ email: email }).then(data => {
            if (!data) {
                throw new Error('no such email exists in our database');
            }
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });

}

userSchema.statics.MatchByCredentials = function(email, password) {

    let user = this;
    return new Promise((resolve, reject) => {
        user.findOne({ email: email }).then(data => {
            if (!data) {
                throw new Error('no such email exists in our database');
            }
            bcrypt.compare(password, data.password)
                .then(doMatch => {
                    if (doMatch) {
                        resolve(data);
                    } else {
                        throw new Error('password is incorrect');
                    }
                })
                .catch(err => {
                    throw new Error(err);
                });

        }).catch(err => {
            reject(err);
        });
    });

}


const userModel = mongoose.model('user', userSchema);
module.exports = userModel;
const { mongoose } = require('./../config');
const Schema = mongoose.Schema;

const postSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

const postModel = mongoose.model('post', postSchema);
module.exports = postModel;
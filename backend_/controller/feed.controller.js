const { validationResult } = require('./../config');
const PostModel = require('./../models/post.model');

exports.getPosts = (req, res, next) => {

    PostModel.find({})
        .then(posts => {
            res.status(200).json({
                posts: posts
            });
        }).catch(err => {
            console.log("err>>", err);
        });

}

exports.createPost = (req, res, next) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(422).json({
            message: 'validation failed',
            errors: error.array()
        });
    }

    let newPost = new PostModel({});
    newPost.title = req.body.title;
    newPost.content = req.body.content;
    newPost.imageUrl = '/images/mask.jpeg';
    newPost.creator = {
        name: 'Roshan',
    }

    newPost.save()
        .then(result => {
            // console.log("result>>", result);
            res.status(201).json({
                message: 'post created successfully!!!',
                post: result
            });
        })
        .catch(err => {
            console.log("err>>", err);
        });

}
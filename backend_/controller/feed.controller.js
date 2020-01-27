const { validationResult } = require('./../config');
const PostModel = require('./../models/post.model');

exports.getPosts = (req, res, next) => {

    PostModel.find({})
        .then(posts => {
            res.status(200).json({
                posts: posts
            });
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}

exports.createPost = (req, res, next) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        throw error; // automatically exit and will be catched by express general error handler middleware
        // return res.status(422).json({
        //     message: 'validation failed',
        //     errors: error.array()
        // });
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
            res.status(201).json({
                message: 'post created successfully!!!',
                post: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err); // will be caught by express general error handler middleware
        });

}
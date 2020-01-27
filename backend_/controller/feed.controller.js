exports.getPosts = (req, res, next) => {

    res.status(200).json({
        title: 'new post',
        body: 'sdlkjfl ldsajflkd sldf nice post'
    });

}



exports.createPost = (req, res, next) => {

    res.status(201).json({
        msg: 'post created successfully!!!'
    });

}
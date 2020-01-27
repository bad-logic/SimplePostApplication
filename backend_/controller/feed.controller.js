exports.getPosts = (req, res, next) => {

    res.status(200).json({
        posts: [{
            _id: '1',
            title: 'First post',
            content: 'This is a very first post',
            imageUrl: 'images/mask.jpeg',
            creator: {
                name: 'Roshan',
            },
            createdAt: new Date()
        }]
    });

}



exports.createPost = (req, res, next) => {

    res.status(201).json({
        msg: 'post created successfully!!!'
    });

}
import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
    state = {
        title: '',
        author: '',
        date: '',
        image: '',
        content: ''
    };

    componentDidMount() {
        const postId = this.props.match.params.postId;
        let gQuery = {
            query: `query FetchSinglePost($postId:ID!){
            getPost(id:$postId){
                title,
                creator{name}
                content,
                imageUrl,
                createdAt
            }
        }`,
            variables: {
                postId: postId
            }
        };
        fetch('http://localhost:8000/graphql', {
                method: "POST",
                headers: {
                    api_key: 'Bearer ' + this.props.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gQuery)
            })
            .then(res => {
                return res.json();
            })
            .then(resData => {
                console.log("resdata>>>", resData);
                if (resData.errors) {
                    throw new Error('fetching post failed!!!');
                }
                this.setState({
                    title: resData.data.getPost.title,
                    author: resData.data.getPost.creator.name,
                    image: 'http://localhost:8000' + resData.data.getPost.imageUrl,
                    date: new Date(resData.data.getPost.createdAt).toLocaleDateString('en-US'),
                    content: resData.data.getPost.content
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    render() {
        return ( < section className = "single-post" >
            <
            h1 > { this.state.title } < /h1>   <
            h2 > Created by { this.state.author }
            on { this.state.date } < /h2>  <
            div className = "single-post__image" >
            <
            Image contain imageUrl = { this.state.image }
            />  < /
            div > <
            p > { this.state.content } < /p>  < /
            section >
        );
    }
}

export default SinglePost;
import { useState, useEffect } from 'react';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const url = `http://localhost:5000/posts`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
      }, []);

function handleAddPost() {
    const newPost = { title, content };
    fetch('http://localhost:5000/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to add post');
      }
      return response.json();
    })
    .then((addedPost) => {
      setPosts((prevPosts) => [...prevPosts, addedPost]);
      setTitle('');
      setContent('');
    })
    .catch((error) => {
      setError(error.message);
    });
}

function handleDeletePost(postId) {
  fetch(`http://localhost:5000/posts/${postId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    })
    .catch((error) => {
      setError(error.message);
    });
        };

  return (

    <div>

        <div>
            
              <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              />
              
              <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post content"
              />
                <button onClick={handleAddPost}>Add Post</button>
        </div>

      {isLoading && <p>Loading posts...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && !error && (
        <ul>
            {posts.map((post) => (
                <li key={post._id}>
                    {post.title}
                    <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default PostList;
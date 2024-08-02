import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, CircularProgress, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getLocalStorageItem } from '../../services/localstorage';
import { useMyContext } from '../../Context/Context';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const item = getLocalStorageItem();
  const navigate = useNavigate();
  if (!item || !item.id) navigate('/')
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [loading, setLoading] = useState(false);
  const { userGroups, updatePosts } = useMyContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const secData = getLocalStorageItem();
    const date = new Date().toISOString();
    const formData = new FormData();
    formData.append('date', date);
    formData.append('text', text);
    formData.append('media', media);
    formData.append('mediaType', mediaType);
    formData.append('postedById', secData.id);

    try {
      setLoading(true);
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      };
      const response = await axios.post('http://localhost:8082/post/save', formData, {
        headers: headers
      });
      toast.success('Post created successfully');
      updatePosts();
      setText('');
      setMedia(null);
      setMediaType('');
    } catch (error) {
      toast.error('Error creating post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.includes('image') || file.type.includes('video'))) {
      setMedia(file);
      setMediaType(file.type);
    } else {
      toast.error('Invalid file type. Please upload a photo or video.');
    }
  };

  return (
    <Container component="main">
      <Typography component="h2" variant="h5" gutterBottom>
        <b>Create Post</b>
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <input
          accept="image/*,video/mp4,video/x-m4v,video/*"
          id="media-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={handleMediaChange}
        />
        <label htmlFor="media-upload">
          <Button variant="contained" component="span" sx={{ mb: 2 }}>
            Upload Media
          </Button>
        </label>
        {media && (
          <Typography variant="body2" gutterBottom>
            {media.name}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Post'}
        </Button>
      </form>
    </Container>
  );
};

export default CreatePost;

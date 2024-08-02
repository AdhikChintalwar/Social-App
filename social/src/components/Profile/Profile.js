import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../../services/api';
import { getLocalStorageItem, setLocalStorageItem } from '../../services/localstorage';
import MenuAppBar from '../Navbar/navbar';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  List,
  DialogContent,
  ListItem,
  DialogActions,
  ListItemText,
  Avatar,
  Grid,
  IconButton,
  CircularProgress
} from "@mui/material";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const secret = getLocalStorageItem();
  const [userName, setUserName] = useState(secret.userName || '');
  const [name, setName] = useState(secret.name || '');
  const [password, setPassword] = useState(secret.password || '');
  const [bio, setBio] = useState(secret.bio || '');
  const [profilePicture, setProfilePicture] = useState(secret.profilePicture || null);
  const [filename, setFileName] = useState('');
  const [fetchedUser, setFetchedUser] = useState()

  useEffect(() => {
    if (secret.profilePicture) {
      setProfilePicture(secret.profilePicture);
    }
  }, [secret.profilePicture]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', secret.id);
      formData.append('userName', userName);
      formData.append('name', name);
      formData.append('password', password);
      formData.append('bio', bio);
      formData.append('profilePicture', profilePicture);

      const response = await API.post('/user/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLocalStorageItem(response.data.data);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
    setLoading(false);
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);

    setFileName(e.target.files[0]?.name)
  };

  useEffect(() => {
    fetchUserData()
  }, [])
  async function fetchUserData() {
    let res = await API.post("/user/user", {
      id: secret.id,
    });
    let user1 = res.data.data;
    setFetchedUser(user1)
  }


  return (
    <div>
      <MenuAppBar />
      <Container component="main" maxWidth="sm">
        <Box mt={8} display="flex" flexDirection="column" alignItems="center">
          <Typography component="h1" variant="h5">
            Profile
          </Typography>
          <Card sx={{ mt: 3, p: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              alt={name}
              src={profilePicture ? `http://localhost:8082/public/${secret.profilePicture}` : undefined}
              sx={{ width: 100, height: 100 }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture"
              type="file"
              onChange={handleProfilePictureChange}
            />
            <label htmlFor="profile-picture">
              <Typography>{filename}</Typography>
              <Button variant="contained" color="primary" component="span" sx={{ mt: 2 }}>
                Upload Profile Picture
              </Button>
            </label>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Username"
              value={userName}
              disabled
              sx={{ mt: 2 }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              sx={{ mt: 2 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
              {"Followers"}{" : "}{fetchedUser?.followers?.length || 0}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
              {"Pending Request"}{" : "}{fetchedUser?.followRequest?.length || 0}
            </div>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Update'}
            </Button>

          </Card>
        </Box>
      </Container>
    </div>
  );
}


import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, CircularProgress, Grid, Link, colors } from '@mui/material';
import Navbar from '../Navbar/navbar'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../../services/api';
import { setLocalStorageItem } from '../../services/localstorage';
const SignIn = () => {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/user/login', { userName, password });

      if (response.status === 200) {
        const data = response.data.data;

        if (data.id) {
          setLocalStorageItem(data)
          toast.success('Successfully signed in!');
          navigate('/home');
        } else {
          toast.error('Login failed. Please check your credentials.');
        }
      } else {
        toast.error('Server responded with an unexpected status. Please try again later.');
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 400) {
          toast.error('Bad request. Please check your inputs.');
        } else if (error.response.status === 401) {
          toast.error('Unauthorized. Please check your credentials.');
        } else {
          toast.error('An error occurred. Please try again later.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an error
        toast.error('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <><Navbar enable={true} />
      <Container component="main" maxWidth="xs">
        <Box sx={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            <b>Sign In</b>
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              value={userName}
              color='primary'
              inputProps={{style:{color:'white'}}}
              sx={{"label":{color:'white'}}}
              variant='filled'
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              inputProps={{style:{color:'white'}}}
              sx={{"label":{color:'white'}}}

              color='primary'
              variant='filled'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/signup" variant="body2">
                  <p style={{ fontWeight: "bold", color: "red" }}> Don't have an account? Sign Up</p>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default SignIn;

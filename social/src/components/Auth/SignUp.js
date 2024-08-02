import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, CircularProgress, Grid, Link } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../../services/api';
import Navbar from '../Navbar/navbar'
const SignUp = () => {
  const [userName, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      const response = await API.post('/user/save', { userName, name, password });

      const data = response.data.data;

      if (data.id) {
        toast.success('Successfully signed up!');
        navigate('/signin');
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(`An error occurred. Please try again. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar enable={true} />
      <Container component="main" maxWidth="xs">
        <Box mt={14}>
          <Typography component="h1" variant="h5" sx={{textAlign:'center'}}><b>Sign Up</b></Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              label="Username"
              sx={{"label":{color:'white'}}}

              inputProps={{style:{color:'white'}}}
              color='primary'
              
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              label="Name"
              sx={{"label":{color:'white'}}}

              inputProps={{style:{color:'white'}}}
              color='primary'
             
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              inputProps={{style:{color:'white'}}}
              color='primary'
              sx={{"label":{color:'white'}}}

              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Box mt={0}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>
            </Box>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/signin" variant="body2">
                  <p style={{ fontWeight: "bold", color: "red" }}> Already have an account? Sign In</p>
                </Link>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default SignUp;

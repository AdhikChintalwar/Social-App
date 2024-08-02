import React, { useState, useEffect, useContext } from 'react';
import { Container, TextField, Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button } from '@mui/material';
import axios from 'axios';
import { getLocalStorageItem } from '../../services/localstorage';
import { useMyContext } from '../../Context/Context';
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const Search = () => {

  const item = getLocalStorageItem();
  const navigate = useNavigate();
  if (!item || !item.id) navigate('/')
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFollowRequest, setFollowRequest] = useState([])
  const secret = getLocalStorageItem();
  const [fetchedUser, setFetchedUser] = useState()
  const { updatePosts, updateGroups } = useMyContext();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8082/user/getAllUsers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!secret?.id) {
        navigate('/')
        return
      }
      const current = response.data.data[secret.id]
      setCurrentUser(current)
      if (current.followRequest) {
        setFollowRequest(current.followRequest)
      }
      else {
        setFollowRequest([])
      }
      setUsers(Object.values(response.data.data));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  useEffect(() => {


    fetchUsers();
  }, []);

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


  useEffect(() => {
    const filteredUsers = users?.filter(user =>
      user.name.toLowerCase().includes(query?.toLowerCase())
    );
    setResults(filteredUsers);
  }, [query, users]);

  const handleAcceptFollow = async (fromUserId, acceptOrDecline) => {
    try {
      const res = await axios.post('http://localhost:8082/user/follow', {
        "to": secret.id,
        "from": fromUserId,
        "follow": acceptOrDecline
      });
      fetchUsers();
      updatePosts()
      toast.success(acceptOrDecline ? 'Accepted follow request' : "Unfollow")
    }
    catch (error) {
      toast.error('Error following user ' + error.message)
      console.log('error')
    }
  }
  const handleFollow = async (userId, following) => {
    try {
      if (following) {
        handleAcceptFollow(userId, false)
        return
      }

      const secret = getLocalStorageItem();
      const res = await axios.post('http://localhost:8082/user/followRequest', {
        to: userId,
        from: secret.id,
        sendRequest: true
      }, {
        headers: { Authorization: `Bearer ${secret.token}` }
      });
      fetchUsers();
      toast.success('Followed Successfully')
    } catch (error) {
      toast.error('Error following user ' + error.message)
      console.error('Error following user:', error);
    }
  };

  function OpenProfile(userId) {
    let tmpUser = { ...fetchedUser }
    if (!tmpUser.followers) {
      tmpUser.followers = []
    }
    console.log(userId, tmpUser.followers)
    if (tmpUser.id == userId || tmpUser.followers.includes(userId)) {
      console.log("navigt")
      navigate(`/user?userId=${userId}`);
    }
  }
  return (
    <Container component="main" maxWidth="sm">
      <Box mt={8}>
        <Typography component="h1" variant="h5">Pending Requests</Typography>
        <List >
          {
            activeFollowRequest.map(req => {
              return (
                <ListItem key={req.id}>
                  <ListItemText primary={req.name} />
                  <Button variant="contained" color="success" onClick={() => handleAcceptFollow(req.id, true)}    >
                    Accept
                  </Button>
                  <Button style={{ marginLeft: "10px" }} variant="contained" color="error" onClick={() => handleAcceptFollow(req.id, false)}    >
                    Decline
                  </Button>
                </ListItem>
              )
            })
          }

        </List>
      </Box>
      <Box mt={8}>
        <Typography component="h1" variant="h5">Search Users</Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <List>
          {results.map((user) => {

            const following = user.followers?.includes(secret.id)
            const reqSent = user.followRequest?.filter(obj => obj.id === secret.id).length
            const sameUser = user.id === secret.id
            console.log("other user", user);
            return (
              <ListItem
                onClick={() => OpenProfile(user.id)}
                key={user.id} style={{ cursor: "pointer" }}>
                <ListItemAvatar>
                  <Avatar src={'http://localhost:8082/public/' + user.profilePicture} />
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={user.bio} />
                {!(reqSent || sameUser) && <Button variant="contained" color="primary" onClick={(e) => { e.stopPropagation(); handleFollow(user.id, following) }} disabled={false}  >
                  {
                    following ? 'Following' : (reqSent ? 'Request sent' : 'Follow')
                  }
                </Button>
                }
              </ListItem>
            )
          })}
        </List>
      </Box>
    </Container>
  );
};
export default Search;


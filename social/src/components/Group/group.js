import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  TextField,
  Container,
  Box,
  Typography,
  Paper
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getLocalStorageItem } from '../../services/localstorage';
import { useNavigate } from 'react-router-dom';
import { useMyContext } from '../../Context/Context';

const baseURL = 'http://localhost:8082';

export default function Group(props) {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const secret = getLocalStorageItem();
  const item = getLocalStorageItem();
  const navigate = useNavigate();
  const { updateGroups } = useMyContext();

  useEffect(() => {
    if (!secret || !secret.id) {
      navigate('/')
      return
    }
    setUserId(secret.id);
    setUserName(secret.userName);
  }, []);

  const [groups, setGroups] = useState([]);
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/group/getAllGroups`, {
        params: {
          userName: userName,
          password: secret.password // replace with actual password
        }
      });
      setGroups(response.data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (userId) {
      fetchGroups();
    }
  }, [userId, userName, props.toggleFilter]);

  const createGroup = async () => {
    setLoading(true);
    try {
      await axios.post(`${baseURL}/group/save`, {
        name: groupName,
        createdBy: userId,
        members: [userId]
      });
      toast.success('Group created successfully');
      setGroupName('');
      // refetch groups to update the list
      const response = await axios.get(`${baseURL}/group/getAllGroups`, {
        params: {
          userName: userName,
          password: secret.password // replace with actual password
        }
      });
      setGroups(response.data.data);
      updateGroups()
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const addToGroup = async (groupId) => {
    //setLoading(true);
    try {
      await axios.post(`${baseURL}/group/addInGroup`, {
        groupId: groupId,
        memberId: userId
      });
      toast.success('Added to group successfully');
      // refetch groups to update the list
      const response = await axios.get(`${baseURL}/group/getAllGroups`, {
        params: {
          userName: userName,
          password: secret.password // replace with actual password
        }
      });
      setGroups(response.data.data);

    } catch (error) {
      console.error('Error adding to group:', error);
      toast.error('Failed to add to group');
    } finally {
      // setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <TextField
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={createGroup}
            disabled={!groupName}
          >
            Create Group
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {groups.map(group => {
              const groupMembers = group.members;
              const isUserMember = groupMembers?.includes(userId);
              return (
                <ListItem key={group.id} sx={{
                  mb: 2,
                  border: group.id === props.activeFilter?.id ? '2px solid #3f51b5' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: group.id === props.activeFilter?.id ? '#f5f5f5' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }} onClick={() => {
                  props.setPosts(group.posts ? group.posts : [])
                  props.setActiveFilter({
                    name: group.name,
                    id: group.id
                  })
                  props.setActiveGroupPost(true);
                }}>
                  <ListItemText
                    primary={group.name}
                    secondary={`Members: ${groupMembers?.length}`}
                  />
                  <Button
                    variant="outlined"
                    color={isUserMember ? 'success' : 'primary'}
                    disabled={isUserMember}
                    onClick={() => addToGroup(group.id)}
                  >
                    {isUserMember ? 'Active Member' : 'Add to Group'}
                  </Button>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Container>
  );
}

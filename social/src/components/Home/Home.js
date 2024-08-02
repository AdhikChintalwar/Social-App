import React, { useState } from 'react';
import { Container, Box, Typography, Grid, Paper, Button } from '@mui/material';
import PostList from '../Post/PostList';
import CreatePost from '../Post/CreatePost';
import Search from '../Search/Search';
import Group from '../Group/group';
import MenuAppBar from '../Navbar/navbar';
import { getLocalStorageItem } from '../../services/localstorage';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [posts, setPost] = useState([]);
  const item = getLocalStorageItem();
  const navigate = useNavigate();
  if (!item || !item.id) navigate('/')
  const [activeFilter, setActiveFilter] = useState({ name: 'All Posts', id: null })
  const [isActiveGroupPost, setActiveGroupPost] = useState(false);
  const toggleFilter = () => {
    if (activeFilter.name != 'All Posts') {
      setActiveFilter({ name: 'All Posts', id: null })
      setActiveGroupPost(false);
    }
  }

  return (<>
    <div >
      <MenuAppBar />
      <Box sx={{ py: 4, padding: '20px' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          <b style={{color:'white'}}>Home</b>
        </Typography>
        <Grid container spacing={2} md={20} >
          {/* Group component on the left */}
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 1, position: 'sticky', top: 16 }}>
              <Typography >{activeFilter.name == 'All Posts' ? activeFilter.name : <div>
                {activeFilter.name}
                <Button onClick={toggleFilter}>
                  Remove Filter
                </Button>
              </div>}</Typography>
              <Group toggleFilter={toggleFilter} setPosts={setPost} isActiveGroupPost={isActiveGroupPost} setActiveGroupPost={setActiveGroupPost} setActiveFilter={setActiveFilter} activeFilter={activeFilter} />
            </Paper>
          </Grid>
          {/* CreatePost and PostList in the middle */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 1, mb: 4 }}>
              <CreatePost />
            </Paper>

            <PostList isActiveGroupPost={isActiveGroupPost} posts={posts} activeFilter={activeFilter} setActiveGroupPost={setActiveGroupPost} />

          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 1, position: 'sticky', top: 16 }}>
              <Search />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  </>
  );
};

export default Home;

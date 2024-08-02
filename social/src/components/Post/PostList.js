import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { ThumbUp, Comment, Share } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../services/api";
import { getLocalStorageItem } from "../../services/localstorage";
import { useMyContext } from "../../Context/Context";

const PostList = (props) => {
  const item = getLocalStorageItem();
  const navigate = useNavigate();
  if (!item || !item.id) navigate('/')
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});
  const [open, setOpen] = useState(false);
  const { userGroups } = useMyContext();
  const secretData = getLocalStorageItem();
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { posts: Posts } = useMyContext();
  const { updatePosts, updateGroups } = useMyContext();

  const fetchPosts = async () => {
    try {

      const [response, res] = await Promise.all([
        API.get("/post/getAllPosts", {
          params: {
            userName: secretData.userName,
            password: secretData.password,
          },
        }),
        API.post("/user/user", {
          id: secretData.id,
        }),
      ]);
      let posts = response.data.data;
      if (props.isActiveGroupPost) {
        posts = posts.filter((post) => props.posts?.includes(post.id));
      }
      posts = posts.sort((a, b) => b.createdOn - a.createdOn);

      let user = res.data.data;

      if (!user.followers) {
        user.followers = []
      }
      posts = posts.filter((pst) => {
        if (pst.postedById === user.id) return true;
        if (user.followers.includes(pst.postedById)) return true;
        return false

      })
      setPosts(posts);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching posts", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [props.activeFilter, Posts]);

  const handleSharePost = (postId) => {
    setSelectedPostId(postId);
    setOpen(true);
  };

  const handleShare = async () => {
    try {
      await API.post("/group/share", {
        postId: selectedPostId,
        groupId: selectedGroup,
      });
      toast.success("Post shared successfully");
      setOpen(false);
      updatePosts()
      updateGroups()
    } catch (error) {
      toast.error("Error sharing post");
    }
  };

  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleCommentSubmit = async (postId) => {
    try {
      const id = secretData.id;
      await API.post("/post/comment", {
        postId: postId,
        text: comments[postId],
        userId: id,
      });

      toast.success("Comment added successfully");
      fetchPosts();
      setComments({ ...comments, [postId]: '' });
    } catch (error) {
      toast.error("Error adding comment");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const id = secretData.id;
      await API.post("/post/like", {
        postId: postId,
        userId: id,
        like: true,
      });

      toast.success("Post liked successfully");
      fetchPosts();
    } catch (error) {
      toast.error("Error liking post");
    }
  };
  console.log("posts", posts)
  return (
    <Container>
      <Box mt={4}>
        {posts.map((post) => (
          <Card key={post.id} sx={{ marginBottom: 2, borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <Avatar
                  sx={{ marginRight: 2 }}
                  src={'http://localhost:8082/public/' + post.postedBy.profilePicture}
                  alt={post.postedBy.username}
                />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {post.postedBy.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(post.createdOn).toLocaleString("en-US")}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" marginBottom={2}>
                {post.text}
              </Typography>
              {post.media && (
                post.mediaType === 'photo' ? (
                  <CardMedia
                    component="img"
                    image={'http://localhost:8082/public/' + post.media}
                    alt="Post media"
                    sx={{ borderRadius: 2, marginBottom: 2 }}
                  />
                ) : post.mediaType === 'video' ? (
                  <video
                    src={'http://localhost:8082/public/' + post.media}
                    controls
                    style={{ borderRadius: 2, marginBottom: 2, width: '100%' }}
                  />
                ) : null
              )}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">
                  {post.likes ? post.likes.length : 0} Likes
                </Typography>
                <Box display="flex" alignItems="center">
                  <IconButton
                    color="primary"
                    disabled={post.likes?.includes(secretData.id)}
                    onClick={() => handleLikePost(post.id)}
                  >
                    <ThumbUp />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleSharePost(post.id)}>
                    <Share />
                  </IconButton>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" marginTop={2}>
                <TextField
                  label="Add a comment"
                  variant="outlined"
                  fullWidth
                  value={comments[post.id] || ''}
                  onChange={(e) => setComments({ ...comments, [post.id]: e.target.value })}
                  sx={{ marginRight: 1 }}
                  id={post.id}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleCommentSubmit(post.id)}
                >
                  <Comment />
                </Button>
              </Box>
              {post.comments &&
                post.comments.reverse().map((comment) => (
                  <Box key={comment.id} sx={{ marginTop: 1, paddingLeft: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      {comment.user?.name} commented at :{new Date(comment.createdOn).toLocaleString("en-US")}
                    </Typography>
                    <Typography variant="body1">{comment.text}</Typography>
                  </Box>
                ))}
            </CardContent>
          </Card>
        ))}
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Select a group to share the post</DialogTitle>
        <DialogContent>
          <List>
            {userGroups.map((group) => (
              <ListItem
                button
                key={group.id}
                selected={selectedGroup === group.id}
                onClick={() => setSelectedGroup(group.id)}
              >
                <ListItemText primary={group.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            color="primary"
            variant="contained"
            disabled={!selectedGroup}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostList;

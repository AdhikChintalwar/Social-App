import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../../services/api';
import { getLocalStorageItem, setLocalStorageItem } from '../../services/localstorage';
import MenuAppBar from '../Navbar/navbar';
import React, { useState, useEffect } from 'react';

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

function Index() {

    const urlSearchString = window.location.search;
    const params = new URLSearchParams(urlSearchString);
    const userId = params.get('userId');
    const [fetchedUser, setFetchedUser] = useState()
    const [allPosts, setAllPosts] = useState([])





    useEffect(() => {
        fetchUserData()
    }, [])
    async function fetchUserData() {
        let res = await API.post("/user/user", {
            id: userId
        });

        const response = await API.get("/post/getAllPosts", {

        });
        let posts = response.data.data;
        console.log("p1", posts)
        posts = posts.filter((pst) => {
            if (pst.postedById === userId) return true;
            return false
        })
        console.log("p2", posts)
        setAllPosts(posts)
        setFetchedUser(res.data.data)
    }

    return (
        <div>
            <Container component="main" maxWidth="sm">
                <Box mt={8} display="flex" flexDirection="column" alignItems="center">
                    <Typography component="h1" variant="h5">
                        Profile
                    </Typography>
                    <Card sx={{ mt: 3, p: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            alt={fetchedUser?.name || ""}
                            src={fetchedUser?.profilePicture ? `http://localhost:8082/public/${fetchedUser.profilePicture}` : undefined}
                            sx={{ width: 100, height: 100 }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                            <p>
                                {"Name"}
                            </p>
                            <p style={{ marginLeft: "10px" }}>
                                {fetchedUser?.name || ""}
                            </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-start", width: "100%", marginTop: "-17px" }}>
                            <p>
                                {"UserName"}
                            </p>
                            <p style={{ marginLeft: "10px" }}>
                                {fetchedUser?.userName || ""}
                            </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                            {"Followers"}{" : "}{fetchedUser?.followers?.length || 0}
                        </div>
                    </Card>
                </Box>
            </Container>
            <Container>
                <Box mt={4}>
                    {allPosts.map((post) => (
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
            </Container>
        </div>
    )
}

export default Index
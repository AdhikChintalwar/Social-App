import express from 'express';
const router = express.Router();
import 'dotenv/config';
import helper from '../helper.js';
import dbRef from '../dbRef.js';
import moment from 'moment';
import multer from 'multer'
// Set up storage for uploaded files
import { v4 as uuidv4 } from 'uuid';
import path from 'path'
const storage = multer.diskStorage({
    destination: './public/',
    filename: function (req, file, cb) {
        cb(null,  uuidv4() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
router.post('/save', upload.single('media'), async (req, res) => {
    console.log(req.headers)
    console.log(req.body)
    try {
        const { firebaseDb } = res.locals;
        let post = {
            text:req.body.text,
            date:req.body.date,
            mediaType:req.body.mediaType,
            postedById:req.body.postedById,
            media:(req.file?.name)?req.file?.name:''
            
        }

        if (req.file) {
            const fileType = path.extname(req.file.originalname).toLowerCase();
            console.log('filetype',fileType)
            if (fileType === '.jpg' || fileType === '.jpeg' || fileType === '.png') {
                post.mediaType = 'photo';
            } else if (fileType === '.mp4' || fileType === '.avi' || fileType === '.mov') {
                post.mediaType = 'video';
            } else {
                return res.status(400).send({ msg: 'Unsupported media type' });
            }
            post.media = req.file ? path.basename(req.file.path) : '';
        }
       
        console.log('psot',post)
        if (post.id) {
            await helper.updateData(firebaseDb, dbRef.post, post.id, post);
        } else {
            let userPromise = helper.getByChild(firebaseDb, dbRef.user, post.postedById);
            let postIdPromise = helper.getId(firebaseDb, dbRef.post);
            let [user, postId] = await Promise.all([userPromise, postIdPromise]);
            post.postedBy = user;
            post.createdOn = moment().valueOf();
            post.id = postId;
            await helper.setData(firebaseDb, dbRef.post, post.id, post);
        }
        let data = await helper.getNodeData(firebaseDb, dbRef.post);
        return res.status(200).send({ data: data, msg: "post saved successfully" });
    } catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});

router.post('/comment', async (req, res) => {
    try {
        console.log(req.body)
        const { firebaseDb } = res.locals
        let postId = req.body.postId;
        let userId = req.body.userId;
        let text = req.body.text;
        if (!postId || !userId || !text) {
            return res.status(400).send({ msg: "some detail is missing" });
        }
        var [commentId, post] = await Promise.all([
            await helper.getId(firebaseDb, dbRef.comment),
            await helper.getByChild(firebaseDb, dbRef.post, postId),
        ])
        if (!post) {
            return res.status(400).send({ msg: "post not found" });
        }
        if (!post.comments) {
            post.comments = [];
        }
        post.comments.push({
            id: commentId, userId, text, createdOn: moment().valueOf()
        })
        await helper.updateData(firebaseDb, dbRef.post, post.id, post);
        let data = await helper.getAllPost(firebaseDb);
        return res.status(200).send({ data: data, msg: "commment added" });
    }
    catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});




router.post('/like', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        let userId = req.body.userId;
        let postId = req.body.postId;
        let like = req.body.like || false;
        if (!userId || !postId) {
            return res.status(400).send({ msg: "some detail is missing" });
        }
        let post = await helper.getByChild(firebaseDb, dbRef.post, postId);
        if (!post) {
            return res.status(400).send({ msg: "post not found" });
        }
        if (!post.likes) {
            post.likes = [];
        }
        // manage duplicate and unlike thing
        post.likes = post.likes.filter((id) => { return id != userId })
        if (like) {
            post.likes.push(userId);
        }
        await helper.updateData(firebaseDb, dbRef.post, post.id, post);
        let data = await helper.getNodeData(firebaseDb, dbRef.post);
        return res.status(200).send({ data: data, msg: like ? "like" : "unlike" });
    }
    catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});


router.get('/getAllPosts', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        let data = await helper.getAllPost(firebaseDb);
        return res.status(200).send({ data: data, });
    }
    catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});



export default router;

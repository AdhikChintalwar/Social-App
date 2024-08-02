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
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
router.post('/save', upload.single('profilePicture'), async (req, res) => {

    try {
        const { firebaseDb } = res.locals
        let user = req.body

        if (!user.name || !user.userName || !user.password) {
            return res.status(400).send({ data: user, msg: "some detail is missing" });
        }
        if (user.id) {
            let db_user = await helper.getByChild(firebaseDb, dbRef.user, user.id)
            let user1 = {
                id: req.body.id,
                name: req.body.name,
                userName: req.body.userName,
                password: req.body.password,
                bio: (req.body.bio ? req.body.bio : db_user.bio) || null,
                profilePicture: (req.body.profilePicture ? req.body.profilePicture : db_user.profilePicture) || null
            };
            if (req.file) {
                const fileType = path.extname(req.file.originalname).toLowerCase();

                user1.profilePicture = req.file ? path.basename(req.file.path) : '';
            }
            await helper.updateData(firebaseDb, dbRef.user, user1.id, user1)

            return res.status(200).send({ data: user1, msg: "user saved successfully" });
        }
        else {
            const [ifUserNameExit, userId] = await Promise.all([
                helper.orderByChild(firebaseDb, dbRef.user, "userName", user.userName),
                helper.getId(firebaseDb, dbRef.user)
            ]);
            if (ifUserNameExit.length) {
                return res.status(200).send({ data: user, msg: "user name already exits" });
            }
            user.id = userId;
            await helper.setData(firebaseDb, dbRef.user, user.id, user);
        }
        return res.status(200).send({ data: user, msg: "user saved successfully" });
    }
    catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});
router.get('/getAllUsers', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        let data = await helper.getNodeData(firebaseDb, dbRef.user);
        return res.status(200).send({ data: data, });
    }
    catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});

router.post('/user', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        let data = await helper.getByChild(firebaseDb, dbRef.user, req.body.id);
        return res.status(200).send({ data: data, });
    }
    catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { firebaseDb } = res.locals;
        let user = req.body;

        // Check if userName or password is missing
        if (!user.userName || !user.password) {
            return res.status(400).send({ data: user, msg: "Some details are missing" });
        }

        // Fetch user from Firebase DB
        let result = await helper.orderByChild(firebaseDb, dbRef.user, "userName", user.userName);

        if (result.length > 0) {
            let fetchedUser = result[0];
            // Check if password matches
            if (fetchedUser.password === user.password) {
                return res.status(200).send({ data: fetchedUser, msg: "User logged in successfully" });
            } else {
                // Password mismatch error should return 401 Unauthorized
                return res.status(401).send({ data: user, msg: "Unauthorized: Password is incorrect" });
            }
        } else {
            // User not found error should return 404 Not Found
            return res.status(404).send({ data: user, msg: "User not found" });
        }
    } catch (error) {
        console.error('Error in login: ', error);
        return res.status(500).send({ msg: "Internal server error" });
    }
});


router.post('/followRequest', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        let reqBody = req.body;
        if (!reqBody.to || !reqBody.from) {
            return res.status(400).send({ data: reqBody, msg: "some detail is missing" });
        }
        let sendRequest = req.body.sendRequest || null;
        var [toUser, fromUser] = await Promise.all([
            helper.getByChild(firebaseDb, dbRef.user, reqBody.to),
            helper.getByChild(firebaseDb, dbRef.user, reqBody.from)
        ]);

        if (!toUser || !fromUser) {
            return res.status(400).send({ msg: sendRequest ? "failed to follow" : "failed to unfollow" });
        }

        if (!toUser.followRequest) {
            toUser.followRequest = [];
        }

        // managing dublice and both remove thing
        toUser.followRequest = toUser.followRequest.filter((obj) => {
            return obj.id == fromUser.id ? false : true
        })
        if (sendRequest) {
            toUser.followRequest.push(fromUser)
        }
        await helper.updateData(firebaseDb, dbRef.user, toUser.id, toUser);
        return res.status(200).send({ msg: sendRequest ? "request sent successfully" : "request removed successfully" });
    }
    catch (error) {
        console.error('Error in followRequest ', error);
        return res.status(400).send({ msg: error.message });
    }
});

router.post('/follow', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        let reqBody = req.body;
        if (!reqBody.to || !reqBody.from) {
            return res.status(400).send({ data: reqBody, msg: "some detail is missing" });
        }
        let follow = req.body.follow || null;
        var [toUser, fromUser] = await Promise.all([
            helper.getByChild(firebaseDb, dbRef.user, reqBody.to),
            helper.getByChild(firebaseDb, dbRef.user, reqBody.from)
        ]);

        if (!toUser || !fromUser) {
            return res.status(400).send({ msg: follow ? "failed to follow" : "failed to unfollow" });
        }
        if (!toUser.followRequest) {
            toUser.followRequest = []
        }
        if (!fromUser.followRequest) {
            fromUser.followRequest = []
        }
        toUser.followRequest = toUser.followRequest.filter((obj) => {
            return obj.id == fromUser.id ? false : true
        })
        fromUser.followRequest = fromUser.followRequest.filter((obj) => {
            return obj.id == toUser.id ? false : true
        })

        if (!toUser.followers) {
            toUser.followers = [];
        }
        if (!fromUser.followers) {
            fromUser.followers = [];
        }

        // managing followers
        toUser.followers = toUser.followers.filter((id) => {
            return id == fromUser.id ? false : true
        })

        fromUser.followers = fromUser.followers.filter((id) => {
            return id == toUser.id ? false : true
        })
        if (follow) {
            toUser.followers.push(fromUser.id)
            fromUser.followers.push(toUser.id)
        }
        await helper.updateData(firebaseDb, dbRef.user, toUser.id, toUser);
        await helper.updateData(firebaseDb, dbRef.user, fromUser.id, fromUser);
        return res.status(200).send({ msg: follow ? "request accepted" : "request declined" });
    }
    catch (error) {
        console.error('Error in follow: ', error);
        return res.status(400).send({ msg: error.message });
    }
});

export default router;

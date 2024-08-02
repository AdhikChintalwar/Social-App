import express from 'express';
const router = express.Router();
import 'dotenv/config';
import helper from '../helper.js';
import dbRef from '../dbRef.js';
import moment from 'moment';

router.post('/save', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        let group = req.body;
        if (!group.name || !group.createdBy) {
            return res.status(400).send({ data: group, msg: "some detail is missing" });
        }
        if (group.id) {
            await helper.updateData(firebaseDb, dbRef.group, group.id, group);
        }
        else {
            group.createdOn = moment().valueOf();
            group.id = await helper.getId(firebaseDb, dbRef.group)
            await helper.setData(firebaseDb, dbRef.group, group.id, group);
        }

        let data = await getAllGroups(firebaseDb)
        return res.status(200).send({ data: data, msg: "group saved successfully" });
    }
    catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});

async function getAllGroups(firebaseDb) {
    let [allUsers, groups, allPosts] = await Promise.all([
        helper.getNodeData(firebaseDb, dbRef.user),
        helper.getNodeData(firebaseDb, dbRef.group, true),
        helper.getAllPost(firebaseDb)
    ]);

    let allPostsData = {};
    allPosts.map((post) => {
        allPostsData[post.id] = post;
    })

    groups.map((grp) => {
        grp.membersDetail = [];
        grp.members?.map((memberId) => {
            if (allUsers[memberId]) {
                grp.membersDetail.push(allUsers[memberId])
            }
        })
        grp.postDetail = [];
        grp.posts?.map((postId) => {
            if (allPostsData[postId]) {
                grp.postDetail.push(allPostsData[postId])
            }
        })
    })
    return groups;
}

router.get('/getAllGroups', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        let data = await getAllGroups(firebaseDb)
        return res.status(200).send({ data: data, });
    }
    catch (error) {
        console.error('Error in save: ', error);
        return res.status(400).send({ msg: error.message });
    }
});


router.post('/addInGroup', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        if (!req.body.groupId || !req.body.memberId) {
            return res.status(400).send({ data: req.body, msg: "some detail is missing" });
        }
        let group = await helper.getByChild(firebaseDb, dbRef.group, req.body.groupId);
        if (!group.members) {
            group.members = [];
        }
        group.members = group.members.filter((memberId) => { return memberId != req.body.memberId })
        group.members.push(req.body.memberId);
        await helper.updateData(firebaseDb, dbRef.group, group.id, group);
        let data = await getAllGroups(firebaseDb)
        return res.status(200).send({ data: data, });
    }
    catch (error) {
        console.error('Error in add in group: ', error);
        return res.status(400).send({ msg: error.message });
    }
});
router.post('/share', async (req, res) => {
    try {
        const { firebaseDb } = res.locals
        if (!req.body.groupId || !req.body.postId) {
            return res.status(400).send({ data: req.body, msg: "some detail is missing" });
        }
        let group = await helper.getByChild(firebaseDb, dbRef.group, req.body.groupId);
        if (!group.posts) {
            group.posts = [];
        }
        group.posts.push(req.body.postId);
        await helper.updateData(firebaseDb, dbRef.group, group.id, group);
        let data = await getAllGroups(firebaseDb)
        return res.status(200).send({ data: data, });
    }
    catch (error) {
        console.error('Error in share in group: ', error);
        return res.status(400).send({ msg: error.message });
    }
});



export default router;

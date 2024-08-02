import dbRef from "./dbRef.js";


async function getId(firebaseDb, node) {
    return await firebaseDb.ref(node).push().key
}


async function setData(firebaseDb, node, id, reqBody) {
    return await firebaseDb.ref(node).child(id).set(reqBody);
}

async function updateData(firebaseDb, node, id, reqBody) {
    return await firebaseDb.ref(node).child(id).update(reqBody);
}

async function orderByChild(firebaseDb, node, orderByChildKey, orderByValue) {
    try {
        let snapshot;

        if (orderByValue) {
            snapshot = await firebaseDb.ref(node)
                .orderByChild(orderByChildKey)
                .equalTo(orderByValue)
                .once('value');
        } else {
            snapshot = await firebaseDb.ref(node)
                .orderByChild(orderByChildKey)
                .once('value');
        }

        const orderedData = snapshot.val() ? Object.values(snapshot.val()) : [];
        return orderedData;
    } catch (error) {
        console.error('Error ordering data:', error);
        throw error;
    }
}


async function getByChild(firebaseDb, node, childId) {
    try {
        const snapshot = await firebaseDb.ref(node).child(childId).once('value');
        const data = snapshot.val() ? snapshot.val() : null;
        return data;
    } catch (error) {
        console.error('Error ordering data:', error);
        throw error;
    }
}
async function getNodeData(firebaseDb, node, array) {
    try {
        const snapshot = await firebaseDb.ref(node).once('value');
        const data = snapshot.val() ? array ? Object.values(snapshot.val()) : snapshot.val() : array ? [] : {};
        return data;
    } catch (error) {
        console.error('Error ordering data:', error);
        throw error;
    }
}
async function getAllPost(firebaseDb) {
    let [allUsers, postData] = await Promise.all([
        getNodeData(firebaseDb, dbRef.user),
        getNodeData(firebaseDb, dbRef.post, true)
    ]);
    postData.map((post) => {
        post.postedBy = allUsers[post.postedById];
        post.comments = post.comments?.map((comment) => {
            if (allUsers[comment.userId]) {
                return { ...comment, user: allUsers[comment.userId] }
            }
            return { ...comment }
        })
    })
    return postData
}


export default {
    getId,
    setData,
    updateData,
    orderByChild,
    getByChild,
    getNodeData,
    getAllPost
}
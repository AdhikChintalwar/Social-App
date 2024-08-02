import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from 'path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import user from "./routes/user.js";
import post from "./routes/post.js";
import group from "./routes/group.js";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const serviceAccount = {
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
};

initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
});

const firebaseDb = getDatabase();
app.use((req, res, next) => {
    res.locals.firebaseDb = firebaseDb;
    next();
});

app.get('/', (req, res) => {
    res.status(200).send({ "msg": "Api is working" });
});
app.use('/user', user);
app.use('/post', post);
app.use('/group', group);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

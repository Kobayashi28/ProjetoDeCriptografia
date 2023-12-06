import express from 'express';
import multer from 'multer';
import path from 'path';

import authController from './controllers/authController';
import channelController from './controllers/channelController';
import encryptionController from './controllers/encryptionController'

const channelCtrl = new channelController();
const authCtrl = new authController();
const encryptionCtrl = new encryptionController();
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path.join(__dirname, '../uploads/profilePics/'));
    },
    filename: (req, file, cb)=>{   
        cb(null, authCtrl.setFileName(file.originalname));
    }
})

const channelStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path.join(__dirname, '../uploads/channel/'));
    },
    filename: (req, file, cb)=>{   
        cb(null, authCtrl.setFileName(file.originalname));
    }
})

const upload = multer({storage});

const channelUploads = multer({storage:channelStorage});

const routes = express.Router();

routes.post('/auth', authCtrl.auth);

routes.get('/auth/getUser/:username', authCtrl.getUser);

routes.post('/auth/register', upload.single('0'), authCtrl.register);

routes.get('/auth/verify', authCtrl.verifyCookie);

routes.post('/auth/logout', authCtrl.destroyCookie);

routes.get('/channel/list/:user_id', channelCtrl.getChannels);

routes.post('/channel/message', channelCtrl.setMessage);

routes.post('/channel/create', channelUploads.single('channelPicture'), channelCtrl.setChannel);

routes.post('/channel/remove/user', channelCtrl.removeUser);

routes.get('/channel/id/:channelName', channelCtrl.getChannelId);

routes.post('/channel/add/user', channelCtrl.addUser);

routes.get('/channel/message/list/:channelId', channelCtrl.getMessage);

routes.get('/channel/info/:channelId', channelCtrl.getChannelInfo);

routes.get('/users/list', channelCtrl.getUsers);

routes.post('/encrypt', encryptionCtrl.encrypt);

// routes.post('/decrypt', encryptionCtrl.decrypt);

routes.post('/setkey', encryptionController.setKey);

routes.get('/uploads/profilePics/:filename', (req, res)=>{
    res.sendFile(path.join(__dirname, '../uploads/profilePics/' + req.params.filename));
})

routes.get('/uploads/channel/:filename', (req, res)=>{
    res.sendFile(path.join(__dirname, '../uploads/channel/' + req.params.filename));
})

export default routes;
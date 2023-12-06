import { Server } from "socket.io";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import conn from "./database/connection";
import routes from './routes';

// import encryptionController from "./controllers/encryptionController";

// const encryptionCtrl = new encryptionController();

import chatEncryptionController from "./controllers/chatEncryptionController";

const chatEncryption = new chatEncryptionController();

const app = express();

app.use(cors({origin:true, credentials:true}));
app.use(cookieParser());
app.use(express.json());
app.use(routes)
// app.use('/uploads/profilePics', express.static(path.join(__dirname, 'uploads/profilePics')));


app.listen(4001);

const io = new Server({
    cors:{
        allowedHeaders:'*',
        origin:'*',
    }
});

const socketSeparator = '/][{}/';

io.on("connection", (socket) => {

    socket.on('chat', (msg:any)=>{
        let msgSplit = msg.split(socketSeparator);

        // const encrypted = encryptionCtrl.encrypt(msgSplit[2]);

        let getSecretKey = `select secretKey from chatChannel where id = ${msgSplit[1]}`;
        conn.query(getSecretKey, (e, r , f)=>{
            //@ts-ignore
            var encrypted = chatEncryption.encrypt(msgSplit[2], r[0].secretKey);
            var newEncrypted = '';
            for(let i = 0; i < encrypted.split('').length; i++){
                if(encrypted.split('')[i] == '\\'){
                    newEncrypted+=encrypted.split('')[i] + '\\';
                }else{
                    newEncrypted+=encrypted.split('')[i];
                }
            }
            conn.query(`insert into messagesChat(messageContent, id_channel, id_user, id_type) values ('${newEncrypted}', ${msgSplit[1]}, ${msgSplit[0]}, 1)`);
            
            if(msgSplit[4]!='teste'){
                io.emit(msgSplit[1], (msgSplit[2]+socketSeparator+msgSplit[3]+socketSeparator+'text'));
                let getAllUsersInChannel = `select ccu.id_user from chatChannelUser as ccu inner join chatChannel as cc on cc.id = ccu.id_channel where cc.id = ${msgSplit[1]};`;
                conn.query(getAllUsersInChannel, (err, results, fields)=>{
                //@ts-ignore
                console.log(results);
                //@ts-ignore
                for(let i = 0; i < results.length; i++ ){
                    //@ts-ignore
                    io.emit('update-'+results[i].id_user,'notification'); 
                }
            })
            }else{
                console.log(msg);
            }
            
        })
    })


});

io.on('receive',(msg:any)=>{console.log(msg)})

io.listen(4000);

module.exports.ioObject = io;

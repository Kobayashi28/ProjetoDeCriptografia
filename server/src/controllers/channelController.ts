import { Request, Response } from "express";

import mysql from 'mysql2/promise';

const socket = require('../server');

import chatEncryptionController from "./chatEncryptionController";

import conn from "../database/connection";

import encryptionController from "./encryptionController";

// interface getChannelsType{
//     {
//         id:number,
//         channelName:string,
//         secretKey:string,
//         channelPicture:string
//     }
// }

const chatEncryption = new chatEncryptionController();

export default class channelController{


    public getChannels(req:Request, res:Response){
        let sql = `select cc.id, cc.channelName, cc.secretKey, cc.channelPicture from messagesChat as mc inner join chatChannel as cc on cc.id = mc.id_channel inner join chatChannelUser as ccu on ccu.id_channel = cc.id where ccu.id_user = ${req.params.user_id} group by mc.id_channel order by max(mc.sentTime) desc;`
        
        conn.query(sql, (err, results, fields)=>{
            res.json(results);
        });
    }

    public setMessage(req:Request, res:Response){
        let sql =`insert into messagesChat(messageContent, id_channel, id_user, id_type) values ('${req.body.message}',${req.body.channelId}, ${req.body.user_id}, 1);`;

        conn.query(sql, (err, results, fields)=>{
            //@ts-ignore
            if(results.affectedRows >= 1)
                res.json(results);
        });

    }

    public getMessage(req:Request, res:Response){

        let sql = `select mc.messageContent, mc.sentTime, ut.username, mt.ds_type from messagesChat as mc inner join userTable ut on ut.id = mc.id_user inner join messageType as mt on mt.id = mc.id_type where mc.id_channel = ${req.params.channelId} order by mc.id desc limit 50;`

        
        conn.query(sql, (err, results, fields)=>{
            conn.query(`select secretKey from chatChannel where id = ${req.params.channelId}`, (e,r,f)=>{
                //@ts-ignore;
                for(let i = 0; i < results.length; i++){
                    //@ts-ignore
                    if(results[i].ds_type != 'systemAlert'){
                        //@ts-ignore
                        results[i].messageContent = chatEncryption.decrypt(results[i].messageContent, r[0].secretKey);
                    }
                }
                res.json({results});
            })
        });
    }

    public getUsers(req:Request, res:Response){
        let sql = 'select username, profilePic from userTable where id != 1;';

        conn.query(sql, (err, results, fields)=>{
            res.json(results);
        });
    }

    public setChannel(req:Request, res:Response){
        console.log(req.file?.filename);
        console.log(req.body);
        let createChannel = `insert into chatChannel(channelName, secretKey, channelPicture) values ('${req.body.channelName}','${encryptionController.setKey()}', '${req.file?.filename}');`
        
        let usernames = (req.body.userList).split('][');
        usernames.pop();
        usernames.push(req.body.owner);

        conn.query(createChannel, (err, results, fields)=>{
            console.log(results);
            //@ts-ignore
            if(results.affectedRows > 0){

                conn.query(`select id from chatChannel where channelName = '${req.body.channelName}'`, (er, result, field)=>{
                    //@ts-ignore
                    if(result[0].id!== undefined){
                        let lock = false;
                        for(let i = 0; i < usernames.length; i++){
                            let getUser = `select id from userTable where username='${usernames[i]}';`
                            conn.query(getUser, (e, r, f)=>{
                                //@ts-ignore
                                socket.ioObject.emit('update-'+r[0].id, 'newChannel');
                                //@ts-ignore
                                conn.query(`insert into chatChannelUser(id_user, id_channel)values(${r[0].id}, ${result[0].id});`);
                    
                            })
                            if(i == (usernames.length-1)){
                                lock = true;
                            }
                        }
                        if(lock){
                            var d = new Date();
                            var systemMessage = `O canal "${req.body.channelName}" foi criado por ${req.body.owner} em ${d.getUTCDate()}/${d.getUTCMonth()+1}/${d.getUTCFullYear()} às ${d.getHours()}:${d.getMinutes()}`;
                            //@ts-ignore
                            let query = `insert into messagesChat(messageContent, id_channel, id_user, id_type) values ('${systemMessage}', ${result[0].id}, 1, 2);`;
                            conn.query(query);
                            res.json({status:'ok'});
                        }
                    }
                })

            }
        });

        
    
    
    }

    public getChannelInfo(req:Request, res:Response){

        let sql = `select ut.username, ut.profilePic, cc.channelName, cc.channelPicture from chatChannel as cc inner join chatChannelUser as ccu on cc.id = ccu.id_channel inner join userTable as ut on ut.id = ccu.id_user where cc.id=${req.params.channelId} order by ut.username;`

        conn.query(sql, (err, results, fields)=>{
            res.json(results);
        })
    }

    public removeUser(req:Request, res:Response){
        let chatChannelUserID = `select ccu.id from chatChannelUser as ccu inner join chatChannel as cc on cc.id = ccu.id_channel inner join userTable as ut on ut.id = ccu.id_user where cc.id = ${req.body.channelID} and ut.id = ${req.body.userID};`;
        console.log(chatChannelUserID);
        conn.query(chatChannelUserID, (err, results, fields)=>{
            //@ts-ignore
            let rmUser = `delete from chatChannelUser where id = ${results[0].id};`;
            conn.query(rmUser,(e, r, f)=>{
                //@ts-ignore
                if(r.affectedRows > 0){
                    var exitMsg = `O usuário "${req.body.username}" saiu do canal.`;
                    conn.query(`insert into messagesChat(messageContent, id_channel, id_user, id_type) values('${exitMsg}', ${req.body.channelID}, ${req.body.userID}, 2);`);
                    
                    socket.ioObject.emit(req.body.channelID, exitMsg+'/][{}/'+' '+'/][{}/'+'systemAlert')
                    res.json({'status':'ok'});
                }
            })
        });
    }

    public getChannelId(req:Request, res:Response){
        let sql = `select id from chatChannel where channelName = '${req.params.channelName}';`;
        console.log(sql);
        conn.query(sql, (err,results, fields)=>{
            //@ts-ignore
            var result = results[0].id;
            if(result === undefined){
                res.json({status:'Canal não existe'});
            }else{
                res.json({channelId:result});
            }
        });
    }

    public addUser(req:Request, res:Response){
        let getUserID = `select id from userTable where username = '${req.body.username}'`;
        console.log(req.body.username);
        conn.query(getUserID, (err, results, fields)=>{
            //@ts-ignore
            var userID = results[0];
            
            if(userID === undefined){
                res.json({status:'Usuário não existe'});
            }else{
                let verifyIfAlreadyExists = `select ccu.id from chatChannelUser as ccu inner join chatChannel as cc on cc.id = ccu.id_channel inner join userTable as ut on ut.id = ccu.id_user where cc.id = ${req.body.channelID} and ut.id = ${userID.id};`
                
                conn.query(verifyIfAlreadyExists, (error, result, field)=>{
                    //@ts-ignore
                    if(result[0] === undefined){
                        let addUserQuery = `insert into chatChannelUser(id_user,id_channel) values (${userID.id}, ${req.body.channelID})`;    
                        conn.query(addUserQuery, (e, r ,f)=>{
                            //@ts-ignore
                            if(r.affectedRows > 0){
                                socket.ioObject.emit('update-'+userID.id, 'newChannel')
                                res.json({status: 'ok'});
                            }
                        })
                    }else{
                        res.json({status:'Usuário já está no grupo'});
                    }
                })
                
                
            }
            
        });

    }
    

}
import { Request, Response } from "express";

import conn from "../database/connection";

import multer from 'multer';
import path from 'multer';


import jwt from 'jsonwebtoken';

export default class authController {

    public auth(req:Request, res:Response){
        var sql = `select id from userTable where username = '${req.body.username}' && passwd = '${req.body.passwd}'; `
        
        conn.query(sql, (err, results, fields)=>{
            //@ts-ignore
            if(results[0] === undefined)
                return res.json({logged:false});

                //@ts-ignore
                const token = jwt.sign({user_id:results[0].id,username:req.body.username}, 'Fh38ghI9dsa27hR');
                return res.cookie("access_token", token, {httpOnly:true, sameSite:'lax'}).status(200).json({logged:true})
        });
    }

    public setFileName(filename:any){
        var suffix =  Date.now() +Math.round(Math.random()*100);
        var filetype = filename.split('.');
        var ft = filetype[filetype.length-1];
        return (filetype[0] + suffix + '.' + ft);
    }

    public register(req:Request, res:Response){
        // console.log(authController.setFileName(req.file?.originalname));
        let insertUser = `insert into userTable(username, passwd, profilePic) values ('${req.body[1]}', '${req.body[2]}', '${req.file?.filename}');`
        console.log(req.body[1]);

        conn.query(insertUser, (err, results, fields)=>{
            //@ts-ignore
            if(results.affectedRows > 0){
                res.json({status:true})
            }else{
                res.json({status:false});
            }
        });


    }
    public getUser(req:Request, res:Response){
        let sql = `select id from userTable where username = '${req.params.username}';`;
        conn.query(sql, (err, results, fields)=>{
            //@ts-ignore
            if(results[0] === undefined){
                res.json({status:false})
            }else{
                res.json({status:true})
            }
        });
    }
    
    public verifyCookie(req:Request, res:Response){
        const token = req.cookies.access_token;
        if(token){
            try{
                const data = jwt.verify(token, 'Fh38ghI9dsa27hR');
                res.json(data);
            }catch{
                return res.sendStatus(403);
            }
        }else{
            return res.sendStatus(403);
        }
    }

    public destroyCookie(req:Request, res:Response){
        return res.clearCookie('access_token', {httpOnly:true, sameSite:'lax'}).status(200).json({destroyed:true})
    } 

}
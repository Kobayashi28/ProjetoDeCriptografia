import mysql from 'mysql2';

const conn = mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'12345678',
    database:'criptografia'
});


export default conn;


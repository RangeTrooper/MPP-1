let express=require('express');
let router=express.Router;

const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const mysql=require('mysql2');
let connection;
connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"guitarshop",
    password:"njhcbjy19"
});
connection.connect();

router.get('/',function (req,res,next) {

});

module.exports=router;
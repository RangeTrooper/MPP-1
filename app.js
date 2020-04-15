let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require("body-parser");
let fs = require("fs");
let busboy = require ("connect-busboy");

const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY="j,]trn148fhvfnf";

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let jsonParser = bodyParser.json();

let app = express();

app.use(busboy());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/images')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

const mysql=require('mysql2');
let connection;
connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"guitarshop",
    password:"njhcbjy19"
});
connection.connect();

app.get("/api/guitars", function(req, res){
    connection.query("SELECT * FROM warehouse;",function(err, results, fields) {
        let guitars = JSON.stringify(results);
        let content=JSON.parse(guitars);
        res.send(content);
    });
});

app.get('/api/verify', function (req,res){
    let token =req.cookies.token;
    if (token === undefined)
        res.send(false);
    else if (verifyToken(req.cookies.token)) {
        res.send(true);
    }
});

app.post("/api/login", function (req,res) {
    if(!req.body) return res.sendStatus(400);
    let username=req.body.login;
    let password=req.body.password;
    let user=new User(username,password,null);
    let passwordDB ;
    let sql="SELECT password FROM user WHERE login = ?";
    connection.query(sql, user.username,function (err,result) {
        let results = JSON.stringify(result);
        if (result.length>0) {
            let temp = JSON.parse(results);
            passwordDB = temp[0].password;
            if (bcrypt.compareSync(password, passwordDB)) {
                const expiresIn = 60 * 60;
                const accessToken = jwt.sign({login: username}, SECRET_KEY, {expiresIn: expiresIn});
                res.setHeader('Set-Cookie', 'token=' + accessToken + '; expires = '+ setExpiringTime()+';Secure, HttpOnly');
                res.status(200).send();
            } else {
                res.status(401);
            }
        }else{
            res.status(401).send();
        }
    });
});


function setExpiringTime() {
    let currentTime = new Date();
    let time = currentTime.getTime();
    let expireTime = time + 1000*3600;
    currentTime.setTime(expireTime);
    return currentTime.toUTCString();
}

app.post("/api/logout", function (req,res) {
    let token = req.cookies.token;
    res.setHeader('Set-Cookie', 'token= ; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure, HttpOnly');
    res.status(200).send();
});

app.post("/api/register",function (req,res) {
    if(!req.body) return res.sendStatus(400);
    let login=req.body.login;
    let email=req.body.email;
    let password=req.body.password;
    password= bcrypt.hashSync(password,10);
    let data=[login,email,password];
    let sql="INSERT INTO user (login,email,password) VALUES (?,?,?)";
    connection.query(sql,data,function (err) {
        if(err)
            console.log("Error adding a new user");
        else {
            const expiresIn = 60 * 60;
            const accessToken = jwt.sign({login: login}, SECRET_KEY, {expiresIn: expiresIn});
            res.setHeader('Set-Cookie', 'token=' + accessToken + '; expires = '+ setExpiringTime()+';Secure, HttpOnly');
            res.status(200).send();
        }
    });
});

app.post("/api/guitars", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);
    let model = req.body.model;
    let guitar_id = req.body.id;
    let amount = req.body.amount;
    let img_src = req.body.imageSrc;
    if (img_src !== null){
        let array = img_src.split('\\');
        img_src = array[array.length - 1];
    }
    let data = [guitar_id, model, amount, img_src];
    let obj = {guitar_id: guitar_id, guitar_name: model, img_src: img_src, amount_in_stock: amount};
    let sql = "INSERT INTO warehouse VALUES (?,?,?,?)";
    connection.query(sql,data, function (err, results) {
        if (err)
            res.status(400).send();
        else
            res.send(JSON.parse(JSON.stringify(obj)));
    });
});

app.delete("/api/guitars/:id", function(req, res){

    let id = req.params.id;
    let token =req.cookies.token;
    if (token === undefined)
        res.status(401).send();
    else if (verifyToken(req.cookies.token)){
        connection.query("DELETE FROM warehouse WHERE guitar_id = ?",id,function (err,results) {
            if (err)
                console.log(err);
            else {
                console.log("Data Deleted");
                res.send(id);
            }
        });
    }else {
        res.send();
    }
    });

app.post('/api/upload',function (req, res) {
    //let file = req.files.
    let fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname +  '\\public\\images\\'+ filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });
    });
});

process.on("SIGINT",()=>{
    connection.end();
    process.exit();
});
module.exports = app;

function User(username,password,email) {
    this.username=username;
    this.password= password;
    this.email=email;
}

function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY);
}
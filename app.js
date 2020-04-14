let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require("body-parser");
let fs = require("fs");

const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY="j,]trn148fhvfnf";

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let jsonParser = bodyParser.json();

let app = express();

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
app.get("/api/users/:id", function(req, res){

    let id = req.params.id; // получаем id
    let content = fs.readFileSync("C:\\Users\\Alexander\\WebstormProjects\\mpp_2\\public\\data\\users.json", "utf8");
    let users = JSON.parse(content);
    let user = null;
    // находим в массиве пользователя по id
    for(let i=0; i<users.length; i++){
        if(users[i].id===id){
            user = users[i];
            break;
        }
    }
    // отправляем пользователя
    if(user){
        res.send(user);
    }
    else{
        res.status(404).send();
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
                //res.setHeader('Set-Cookie', 'token=' + accessToken + '; expires = 16 Apr 2020 00:00:00;Secure, HttpOnly');
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

function  getUserFromDB(user) {
    let data=[user.username,user.password];
    let password='';
    let sql="SELECT * FROM user;";
    connection.connect();
    connection.query(sql,"alex99", async function (err,results) {
        await results;
        if (err)
            console.log(err.toString());

        /*if(results.length>0)
            return true;
        else
            return false;*/
    });
    return password;
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
            console.log("New User added");
            res.render("index");
        }
    });
    const expiresIn=60*60;
    const accessToken=jwt.sign({login:login},SECRET_KEY,{expiresIn:expiresIn});
    res.status(200).send({ "user":  login, "access_token":  accessToken, "expires_in":  expiresIn});
    //res.redirect('/#');
});

app.post("/api/guitars", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);
    //дописать логику записи в БД
    connection.query("INSERT INTO warehouse VALUES (?,?,?,?,?)");
    let userName = req.body.name;
    let userAge = req.body.age;
    let user = {name: userName, age: userAge};

    let data = fs.readFileSync("C:\\Users\\Alexander\\WebstormProjects\\mpp_2\\public\\data\\users.json", "utf8");
    let users = JSON.parse(data);

    // находим максимальный id
    let id = Math.max.apply(Math,users.map(function(o){return o.id;}))
    // увеличиваем его на единицу
    user.id = id+1;
    // добавляем пользователя в массив
    users.push(user);
    data = JSON.stringify(users);
    // перезаписываем файл с новыми данными
    fs.writeFileSync("C:\\Users\\Alexander\\WebstormProjects\\mpp_2\\public\\data\\users.json", data);
    res.send(user);
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
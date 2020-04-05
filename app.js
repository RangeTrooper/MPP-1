let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require("body-parser");
let fs = require("fs");

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

app.get("/api/users", function(req, res){
    connection.query("SELECT * FROM warehouse;",function(err, results, fields) {
        let guitars = JSON.stringify(results);
        let content=JSON.parse(guitars);
        res.send(content);
    });
    //let content = fs.readFileSync("C:\\Users\\Alexander\\WebstormProjects\\mpp_2\\public\\data\\users.json", "utf8");
    //let users = JSON.parse(content);
    //res.send(users);
});
// получение одного пользователя по id
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
// получение отправленных данных
app.post("/api/users", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

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
// удаление пользователя по id
app.delete("/api/users/:id", function(req, res){

    let id = req.params.id;
    connection.query("DELETE FROM warehouse WHERE guitar_id = ?",id,function (err,results) {
        if (err)
            console.log(err);
        else {
            console.log("Data Deleted");
            res.send(id);
        }
    });

    //let data = fs.readFileSync("C:\\Users\\Alexander\\WebstormProjects\\mpp_2\\public\\data\\users.json", "utf8");
   /* let users = JSON.parse(data);
    let index = -1;
    // находим индекс пользователя в массиве
    for(let i=0; i<users.length; i++){
        if(users[i].id===id){
            index=i;
            break;
        }
    }
    if(index > -1){
        // удаляем пользователя из массива по индексу
        let user = users.splice(index, 1)[0];
         data = JSON.stringify(users);
        fs.writeFileSync("C:\\Users\\Alexander\\WebstormProjects\\mpp_2\\public\\data\\users.json", data);
        // отправляем удаленного пользователя
        res.send(user);
    }
    else{
        res.status(404).send();
    }*/
});
// изменение пользователя
app.put("/api/users", jsonParser, function(req, res){

    if(!req.body) return res.sendStatus(400);

    let userId = req.body.id;
    let userName = req.body.name;
    let userAge = req.body.age;

    let data = fs.readFileSync("C:\\Users\\Alexander\\WebstormProjects\\mpp_2\\public\\data\\users.json", "utf8");
    let users = JSON.parse(data);
    let user;
    for(let i=0; i<users.length; i++){
        if(users[i].id===userId){
            user = users[i];
            break;
        }
    }
    // изменяем данные у пользователя
    if(user){
        user.age = userAge;
        user.name = userName;
        let data = JSON.stringify(users);
        fs.writeFileSync("C:\\Users\\Alexander\\WebstormProjects\\mpp_2\\public\\data\\users.json", data);
        res.send(user);
    }
    else{
        res.status(404).send(user);
    }
});

process.on("SIGINT",()=>{
    connection.end();
    process.exit();
});
module.exports = app;

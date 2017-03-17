var express = require('express');
var jsonFile = require('jsonfile');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function (req, res) {
    console.log('Requested home');
    res.sendfile('public/index.html');
});

app.get('/login', function (req, res) {
    console.log('Requested /login');
    res.sendfile('public/login.html');
});

app.post('/login/login', function (req, res) {
    var users = jsonFile.readFileSync("public/data/users.json");
    for (var u in users) {
        user = users[u];
        console.log(user);
        if (user.mail == req.body.mail)
            if (user.password == req.body.pwd) {
                res.send("erfolgreich");
                break;
            } else {
                res.send("Passwort falsch");
            }
    }
    res.send("nicht vorhanden");
});

app.get('/search', function (req, res) {
    console.log('Requested /search');
    res.sendfile('public/404.html');
});

app.get('/impressum', function (req, res) {
    console.log('Requested /impressum');
    res.sendfile('public/404.html');
});

app.listen(3000, function () {
    console.log('Notizblog-Server läuft auf Port 3000');
});
var express = require('express');

var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
    console.log('Requested home');
    res.sendfile('public/index.html');
});

app.get('/login', function (req, res) {
    console.log('Requested /login');
    res.sendfile('public/login.html');
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
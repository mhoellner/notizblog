var express = require('express');
var jsonFile = require('jsonfile');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static('public'));

var userFile = 'data/users.json';

app.get('/', function (req, res) {
    console.log('Requested home');
    res.sendfile('public/index.html');
});

app.get('/login', function (req, res) {
    console.log('Requested /login');
    res.sendfile('public/login.html');
});

app.get('/userSite', function (req, res) {
    console.log('Requested /userSite');
    res.sendfile('public/userSite.html');
});

app.get('/newArticle', function (req, res) {
    console.log('Requested /newArticle');
    res.sendfile('public/makeEntry.html');
});

app.get('/articlesOverview', function(req, res){
    console.log('Requested /articles');
    res.sendfile('public/articlesOverview.html');
});

app.get('/search', function (req, res) {
    console.log('Requested /search');
    res.sendfile('public/404.html');
});

app.get('/impressum', function (req, res) {
    console.log('Requested /impressum');
    res.sendfile('public/404.html');
});

app.post('/login/login', function (req, res) {
    console.log('User ' + req.body.name + ' want to login');
    var users = jsonFile.readFileSync(userFile);
    for (var u in users) {
        var user = users[u];
        if (user.name == req.body.name)
            if (user.password == req.body.pwd) {
                console.log('User ' + req.body.name + ' logged in');
                res.send("0");
                return;
            } else {
                console.log('Login failed: User ' + req.body.name + ' entered a wrong password');
                res.send("1");
                return;
            }
    }

    console.log('Login failed: User ' + req.body.name + ' does not exist');
    res.send("2");
});

app.post('/login/register', function (req, res) {

    console.log('User ' + req.body.name + ' want to register');

    var users = jsonFile.readFileSync(userFile);
    for (var u in users) {
        var user = users[u];
        if (user.name == req.body.name) {
            console.log('Register failed: User name ' + req.body.name + ' is already in use');
            res.send("2");
            return;
        } else if (user.mail == req.body.mail) {
            console.log('Register failed: Mail ' + req.body.mail + ' has already an account');
            res.send("3");
            return;
        }
    }

    if (req.body.pwd == "" || req.body.pwd2 == "" || req.body.pwd != req.body.pwd2) {
        console.log('Register failed: Passwords aren\'t equal');
        res.send("1");
        return;
    }

    var id = generateId(users);
    var newUser = {id: id, name: req.body.name, mail: req.body.mail, password: req.body.pwd};
    users.push(newUser);
    jsonFile.writeFileSync(userFile, users, {spaces: 2});
    console.log('User ' + req.body.name + ' is registered');
    res.send("0");
});

app.post('/newArticle', function (req, res) {
    console.log('Try to save new article');
    if (req.body.author != ''){
        console.log('User ' + req.body.author + ' saved a new blog entry.');
        //save article
        var fileName = 'public/data/articles.json';
        var articles = jsonFile.readFileSync(fileName);
        var newID = generateId(articles);

        //TODO: Verify file before saving

        var today = new Date();
        var base64data = req.body.picture.replace(/^data:image\/png;base64,/, "");
        var imageFilePath = 'data/img/article-' + newID + '.png';
        fs.writeFile('public/' + imageFilePath, base64data, 'base64', function (err) {
            console.log(err);
        });

        var newArticle = {
            id: newID,
            author: req.body.author,
            content: req.body.content,
            date: today,
            picture: imageFilePath
        };
        articles.push(newArticle);

        jsonFile.writeFileSync(fileName, articles, {spaces: 2});

        res.sendStatus(200);

    } else {
        console.log('No author on POST-Request.');
        res.sendStatus(403);
    }
});

function generateId(array) {
    array.sort(function (a, b) {
        return a.id - b.id;
    });

    var start = array.length;
    for (var i in array) {
        var element = array[i];
        if (element.id == start) {
            start = start + 1;
        }
    }
    return start;
}

app.listen(3000, function () {
    console.log('Notizblog-Server läuft auf Port 3000');
});


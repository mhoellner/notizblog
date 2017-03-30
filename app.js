var express = require('express');
var jsonFile = require('jsonfile');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static('public'));

var userFile = 'data/users.json';
var articleFile = 'public/data/articles.json';
var categoryFile = 'public/data/categories.json';
var indent = {spaces: 2};

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

app.get('/articlesOverview', function (req, res) {
    console.log('Requested /articleOverview');
    res.sendfile('public/articlesOverview.html');
});

app.get('/article', function (req, res) {
    console.log('Requested /article');
    res.sendfile('public/article.html');
});

app.get('/search', function (req, res) {
    console.log('Requested /search');
    res.status(404).sendfile('public/404.html');
});

app.get('/impressum', function (req, res) {
    console.log('Requested /impressum');
    res.status(404).sendfile('public/404.html');
});

app.post('/getUser', function (req, res) {
    var users = jsonFile.readFileSync(userFile);
    for (var u in users) {
        var user = users[u];
        if (user.name == req.body.name) {
            user.password = "This is not the password you are looking for.";
            res.send(user);
            return;
        }
    }

    console.log('User with name ' + req.body.name + ' not found');
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
    jsonFile.writeFileSync(userFile, users, indent);
    console.log('User ' + req.body.name + ' is registered');
    res.send("0");
});

app.post('/newArticle', function (req, res) {
    console.log('Try to save new article');
    if (req.body.author != '') {
        console.log('User ' + req.body.author + ' saved a new blog entry.');
        //save article
        var articles = jsonFile.readFileSync(articleFile);
        var newID = generateId(articles);

        //TODO: Verify file before saving

        var today = new Date();
        var base64data = req.body.picture.replace(/^data:image\/png;base64,/, "");
        var imageFilePath = 'data/img/article-' + newID + '.png';
        fs.writeFile('public/' + imageFilePath, base64data, 'base64', function (err) {
            if (err) {
                console.log(err);
            }
        });

        var newArticle = {
            id: newID,
            author: req.body.author,
            content: req.body.content,
            date: today,
            picture: imageFilePath
        };
        articles.push(newArticle);

        jsonFile.writeFileSync(articleFile, articles, indent);

        res.sendStatus(200);
        adjustArticleCounter(req.body.content.category, true);

    } else {
        console.log('No author on POST-Request.');
        res.sendStatus(403);
    }
});

app.post('/deleteArticle', function (req, res) {
    console.log('Trying to delete article');
    var articles = jsonFile.readFileSync(articleFile);
    for (a in articles) {
        if (articles[a].id == req.body.articleID && articles[a].author == req.body.author) {
            articles.splice(a, 1);
            jsonFile.writeFileSync(articleFile, articles, indent);
            res.sendStatus(200);
            console.log('Deleted Article ' + req.body.articleID);
        }
    }
});

app.post('/updateArticle', function () {
    console.log('Trying to update article');
});

function adjustArticleCounter(categoryID, increment) {
    var categories = jsonFile.readFileSync(categoryFile);
    for (var c in categories) {
        var category = categories[c];
        if (category.id == categoryID) {
            if (increment) {
                category.amount = category.amount + 1;
            } else {
                category.amount = category.amount - 1;
            }
        }
    }
    jsonFile.writeFileSync(categoryFile, categories, indent);
}

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


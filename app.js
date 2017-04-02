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
    res.sendFile('public/index.html', {root: __dirname});
});

app.get('/login', function (req, res) {
    console.log('Requested /login');
    res.sendFile('public/login.html', {root: __dirname});
});

app.get('/userSite', function (req, res) {
    console.log('Requested /userSite');
    res.sendFile('public/userSite.html', {root: __dirname});
});

app.get('/newArticle', function (req, res) {
    console.log('Requested /newArticle');
    res.sendFile('public/makeEntry.html', {root: __dirname});
});

app.get('/updateArticle', function (req, res) {
    console.log('Requested /updateArticle');
    res.sendFile('public/updateArticle.html', {root: __dirname});
});

app.get('/articlesOverview', function (req, res) {
    console.log('Requested /articleOverview');
    res.sendFile('public/articlesOverview.html', {root: __dirname});
});

app.get('/article', function (req, res) {
    console.log('Requested /article');
    res.sendFile('public/article.html', {root: __dirname});
});

app.get('/search', function (req, res) {
    console.log('Requested /search');
    res.sendFile('public/search.html', {root: __dirname});
});

app.get('/impressum', function (req, res) {
    console.log('Requested /impressum');
    res.status(404).sendFile('public/404.html', {root: __dirname});
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

        if (req.body.picture != null) {
            var imageFilePath = savePicture(req.body.picture, newID);
        } else {
            var imageFilePath = '';
        }

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

app.post('/updateArticle', function (req, res) {
    console.log('Try to update article');

    var articles = jsonFile.readFileSync(articleFile);
    var updatedArticle;

    for (var a in articles) {
        var article = articles[a];
        if (article.id == req.body.id) {
            updatedArticle = article;
            articles.splice(a, 1);
            break;
        }
    }

    if (req.body.author != '' && req.body.author == updatedArticle.author) {
        console.log('User ' + req.body.author + ' updated a new blog entry.');

        if (req.body.content.category != updatedArticle.content.category) {
            adjustArticleCounter(req.body.content.category, true);
            adjustArticleCounter(updatedArticle.content.category, false);
        }

        //TODO: Verify file before saving

        var today = new Date();

        if (req.body.picture != null) {
            var imageFilePath = savePicture(req.body.picture, updatedArticle.id);
        } else {
            var imageFilePath = '';
        }

        var newArticle = {
            id: updatedArticle.id,
            author: updatedArticle.author,
            content: req.body.content,
            date: today,
            picture: imageFilePath
        };

        articles.push(newArticle);

        jsonFile.writeFileSync(articleFile, articles, indent);

        res.sendStatus(200);

    } else {
        console.log('Failure with author while updating article');
        res.sendStatus(403);
    }
});

app.post('/deleteArticle', function (req, res) {
    console.log('Trying to delete article');
    var articles = jsonFile.readFileSync(articleFile);
    for (a in articles) {
        if (articles[a].id == req.body.articleID){
            if (articles[a].author == req.body.author){
                var removedArticle = articles.splice(a, 1);
                jsonFile.writeFileSync(articleFile, articles, indent);
                res.status(200).send(removedArticle);
                adjustArticleCounter(removedArticle[0].content.category, false);
                console.log('Deleted Article ' + req.body.articleID);
            } else {
                res.sendStatus(401);
                console.log(req.body.author + ' tried to delete article ' + req.body.articleID + ' but isn\'t the author.');
            }
        }
    }
});

function savePicture(pic, articleID) {
    var base64data = pic.replace(/^data:image\/png;base64,/, "");
    var imageFilePath = 'data/img/article-' + articleID + '.png';
    fs.writeFile('public/' + imageFilePath, base64data, 'base64', function (err) {
        if (err) {
            console.log(err);
        }
    });
    return imageFilePath;
}

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


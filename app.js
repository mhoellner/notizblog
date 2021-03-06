// --- modules ---
var express = require('express');
var jsonFile = require('jsonfile');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static('public'));

// --- global variables ---
var userFile = 'data/users.json';
var articleFile = 'public/data/articles.json';
var categoryFile = 'public/data/categories.json';
var commentsFile = 'public/data/comments.json';
var indent = {spaces: 2};

// --- get methods ---

app.get('/', function (req, res) {
    console.log('Requested home');
    res.sendFile('public/index.html', {root: __dirname});
});

app.get('/login', function (req, res) {
    console.log('Requested /login');
    res.sendFile('public/login.html', {root: __dirname});
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

app.get('/imprint', function (req, res) {
    console.log('Requested /imprint');
    res.sendFile('public/imprint.html', {root: __dirname});
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

app.get('*', function (req, res) {
    res.status(404).sendFile('public/404.html', {root: __dirname});
});

// --- post methods ---
// user management
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

// article management
app.post('/newArticle', function (req, res) {
    console.log('Try to save new article');
    if (req.body.author != '') {
        console.log('User ' + req.body.author + ' saved a new blog entry.');
        //save article
        var articles = jsonFile.readFileSync(articleFile);

        var newID = generateId(articles);

        if (req.body.picture != null) {
            var imageFilePath = savePicture(req.body.picture, newID);
        } else {
            var imageFilePath = '';
        }

        if (req.body.content.category == null) {
            req.body.content.category = 6;
        }

        var reg = /\n/;
        var text = req.body.content.text;
        while (text.match(reg)) {
            text = text.replace(reg, "<br>");
        }
        req.body.content.text = text;

        var today = new Date();
        var newArticle = {
            id: newID,
            author: req.body.author,
            content: req.body.content,
            date: today,
            picture: imageFilePath
        };

        articles.push(newArticle);
        jsonFile.writeFileSync(articleFile, articles, indent);

        adjustArticleCounter(req.body.content.category, true);

        res.sendStatus(200);
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

        if (req.body.picture != null) {
            var imageFilePath = savePicture(req.body.picture, updatedArticle.id);
        } else {
            var imageFilePath = updatedArticle.picture;
        }

        var reg = /\n/;
        var text = req.body.content.text;
        while (text.match(reg)) {
            text = text.replace(reg, "<br>");
        }
        req.body.content.text = text;

        var today = new Date();
        var newArticle = {
            id: updatedArticle.id,
            author: updatedArticle.author,
            content: req.body.content,
            date: today,
            picture: imageFilePath
        };

        articles.push(newArticle);
        jsonFile.writeFileSync(articleFile, articles, indent);

        if (req.body.content.category != updatedArticle.content.category) {
            adjustArticleCounter(req.body.content.category, true);
            adjustArticleCounter(updatedArticle.content.category, false);
        }

        res.sendStatus(200);
        console.log('User ' + req.body.author + ' updated a new blog entry.');
    } else {
        res.sendStatus(403);
        console.log('Failure with author while updating article');
    }
});

app.post('/deleteArticle', function (req, res) {
    console.log('Trying to delete article');
    var articles = jsonFile.readFileSync(articleFile);
    for (a in articles) {
        if (articles[a].id == req.body.articleID) {
            if (articles[a].author == req.body.author) {
                var removedArticle = articles.splice(a, 1);
                jsonFile.writeFileSync(articleFile, articles, indent);
                res.status(200).send(removedArticle);
                adjustArticleCounter(removedArticle[0].content.category, false);
                deleteComments(removedArticle[0].id);
                console.log('Deleted Article ' + req.body.articleID);
            } else {
                res.sendStatus(401);
                console.log(req.body.author + ' tried to delete article ' + req.body.articleID + ' but isn\'t the author.');
            }
        }
    }
});

// --- comment management ---
app.post('/addComment', function (req, res) {
    if (req.body.comment != null && req.body.articleID != null) {
        var comments = jsonFile.readFileSync(commentsFile);
        var newID = generateId(comments);
        var author = 'Anonymous';
        if (req.body.author != null) {
            author = req.body.author;
        }
        var ancestor = -1;
        if (req.body.ancestor != null) {
            ancestor = req.body.ancestor;
        }
        var today = new Date();
        var newComment = {
            "id": newID,
            "article": req.body.articleID,
            "ancestor": ancestor,
            "text": req.body.comment,
            "author": author,
            "date": today
        };
        comments.push(newComment);
        jsonFile.writeFileSync(commentsFile, comments, indent);
        res.sendStatus(200);
        console.log(author + ' commented on ' + req.body.articleID);
    } else {
        res.sendStatus(400); //Bad Request
        console.log('Comment wasn\'t complete.');
    }
});

// --- functions ---
function savePicture(pic, articleID) {
    var regPNG = /^data:image\/png;base64,/;
    var regJPG = /^data:image\/jpeg;base64,/;
    var base64data = null;
    var imageFilePath = '';
    if (pic.match(regPNG)) { //if its a .png
        base64data = pic.replace(regPNG, "");
        imageFilePath = 'data/img/article-' + articleID + '.png';
        fs.writeFile('public/' + imageFilePath, base64data, 'base64', function (err) {
            if (err) {
                console.log(err);
            }
        });
    } else if (pic.match(regJPG)) { //if it's a .jpg
        base64data = pic.replace(regJPG, "");
        imageFilePath = 'data/img/article-' + articleID + '.jpg';
        fs.writeFile('public/' + imageFilePath, base64data, 'base64', function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    return imageFilePath;
}

function deleteComments(id) {
    var comments = jsonFile.readFileSync(commentsFile);
    for (c = comments.length - 1; c >= 0; c--) {
        var comment = comments[c];
        if (comment.article == id) {
            comments.splice(c, 1);
            console.log('Deleted comment ' + c);
        }
    }
    jsonFile.writeFileSync(commentsFile, comments, indent);
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


notizblogApp.service('userService', function ($http, $cookies) {
    var self = this;
    self.login = function (user, callback) {
        $http.post('/login/login', user)
            .then(function (res) {
                if (res.data == "0") {
                    // login ok
                    $cookies.put('nbUser', user.name);
                    callback(res.data);
                } else if (res.data == "1") {
                    // wrong password
                    callback(res.data);
                } else if (res.data == "2") {
                    // user not found
                    callback(res.data);
                }
            });
    };

    self.logout = function () {
        $cookies.remove('nbUser');
    };

    self.register = function (user, callback) {
        $http.post('/login/register', user)
            .then(function (res) {
                if (res.data == "0") {
                    // register was successful
                    $cookies.put('nbUser', user.name);
                    callback(res.data);
                } else if (res.data == "1") {
                    // passwords aren't equal
                    callback(res.data);
                } else if (res.data == "2") {
                    // user name already taken
                    callback(res.data);
                } else if (res.data == "3") {
                    // account with email exists
                    callback(res.data)
                }
            });
    };

    // gives the user with the given name
    self.searchUserByName = function (name, callback) {
        $http.post('/getUser', {"name": name})
            .then(function (res) {
                callback(res.data);
            });
    };
});

notizblogApp.service('categoryService', function ($http) {
    var self = this;

    // gives all categories
    self.allCategories = function (callback) {
        $http.get('data/categories.json')
            .then(function (res) {
                callback(res.data);
            });
    };

    // gives the category with the given id
    self.searchCategory = function (id, callback) {
        $http.get('data/categories.json')
            .then(function (res) {
                resData = res.data;
                for (var i = 0; i < resData.length; i++) {
                    var category = resData[i];
                    if (category.id == id) {
                        callback(category);
                        break;
                    }
                }
            });
    };
});

notizblogApp.service('articleService', function ($http) {
    var self = this;

    // gives all articles
    self.allArticles = function (callback) {
        $http.get('data/articles.json')
            .then(function (res) {
                callback(res.data);
            });
    };

    // gives the article with the given id
    self.searchArticle = function (id, callback) {
        $http.get('data/articles.json')
            .then(function (res) {
                resData = res.data;
                for (var i = 0; i < resData.length; i++) {
                    var article = resData[i];
                    if (article.id == id) {
                        callback(article);
                        break;
                    }
                }
            });
    };
});
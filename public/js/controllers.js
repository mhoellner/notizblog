notizblogApp.controller('navbarCtrl', function ($scope, $cookies, categoryService) {
    // show different things in menu if the user is logged in
    var user = $cookies.get('nbUser');
    if (user != null) {
        document.getElementById('loginNav').style.display = 'none';
    } else {
        document.getElementById('userNav').style.display = 'none';
    }
});

notizblogApp.controller('usernameCtrl', function ($scope, $cookies) {
    $scope.username = $cookies.get('nbUser');
});

notizblogApp.controller('userCtrl', function ($scope, userService) {
    $scope.articleInitialized
        .then(function (resolved) {
            var user = $scope.actualArticle.author;
            userService.searchUserByName(user, function (res) {
                $scope.user = res;
            });
        });
});

notizblogApp.controller('loginCtrl', function ($scope, userService) {
    $scope.login = function () {
        userService.login($scope.user, function (resData) {
            if (resData == "0") {
                window.location = "/userSite";
            } else if (resData == "1") {
                // wrong password
                $('#loginError').html('<div class="alert alert-danger" role="alert">Falsches Passwort. Bitte versuche es erneut.</div>');
                $scope.user.pwd = '';
                $('#loginPwd').focus();
            } else if (resData == "2") {
                // user not found
                var htmlString = '<div class="alert alert-danger" role="alert">Es wurde kein Nutzer mit dem Nutzernamen \"' + $scope.user.name + '\" gefunden. Bitte registriere dich.</div>';
                $('#loginError').html(htmlString);
                $scope.user = '';
                $('#loginName').focus();
            }
        });
    };
});

notizblogApp.controller('logoutCtrl', function ($scope, userService) {
    $scope.logout = function () {
        userService.logout();
        window.location = "/";
    };
});

notizblogApp.controller('registerCtrl', function ($scope, userService) {
    $scope.register = function () {
        userService.register($scope.user, function (resData) {
            if (resData == "0") {
                // register was successful
                window.location = "/userSite";
            } else if (resData == "1") {
                // passwords aren't equal
                $('#registerError').html('<div class="alert alert-danger" role="alert">Die Passwörter stimmen nicht überein.</div>');
                $scope.user.pwd = '';
                $scope.user.pwd2 = '';
                $('#registerPwd1').focus();
            } else if (resData == "2") {
                // user name already taken
                $('#registerError').html('<div class="alert alert-danger" role="alert">Der Nutzername ist bereits vergeben.</div>');
                $scope.user.pwd = '';
                $scope.user.pwd2 = '';
                $('#registerName').focus();
            } else if (resData == "3") {
                // account with email exists
                $('#registerError').html('<div class="alert alert-danger" role="alert">Es existiert bereits ein Account mit dieser E-Mail-Adresse. Bitte melde dich an.</div>');
                $scope.user = '';
                $('#registerName').focus();
            }
        });
    };
});

notizblogApp.controller('allCategoriesCtrl', function ($scope, categoryService) {
    categoryService.allCategories(function (res) {
        $scope.categories = res;
    });
});

notizblogApp.controller('categoryByIdCtrl', function ($scope, categoryService) {
    var params = window.location.search.substring(1);
    params = params.split('&');
    for (var i in params) {
        var string = params[i];
        if (string.search(/^category/) != -1) {
            var id = string.substring(string.indexOf("=") + 1);
            break;
        }
    }

    categoryService.searchCategory(id, function (res) {
        $scope.actualCategory = res;
    });
});

notizblogApp.controller('articleFormCtrl', function ($scope, $http, $cookies) {
    if ($cookies.get('nbUser') != null) {
        $scope.saveArticle = function () {

            var picture = document.getElementById('input-picture').files[0];
            var reader = new FileReader(); // HTML5 File Reader
            reader.readAsDataURL(picture);
            reader.onload = function (theFileData) {
                var fileData = theFileData.target.result; // Ergebnis vom FileReader auslesen

                var jsonData = {
                    "content": $scope.article,
                    "picture": fileData,
                    "author": $cookies.get('nbUser')
                };

                $http.post('/newArticle', jsonData)
                    .then(function (res) {
                        if (res.status == 200) {
                            window.location = '/userSite';
                        } else if (res.status == 403) {
                            window.location = '/login';
                        } else {
                            alert('Ein Fehler ist aufgetreten.');
                        }
                    });

            };
        };
    } else {
        // Der Nutzer ist nicht korrekt eingeloggt
        window.location = '/login';
    }
});

notizblogApp.controller('allArticlesCtrl', function ($scope, articleService) {
    articleService.allArticles(function (res) {
        $scope.articles = res;
    });
});

notizblogApp.controller('articleByIdCtrl', function ($scope, $q, articleService) {
    var params = window.location.search.substring(1);
    params = params.split('&');
    for (var i in params) {
        var string = params[i];
        if (string.search(/^id/) != -1) {
            var id = string.substring(string.indexOf("=") + 1);
            break;
        }
    }

    var deferred = $q.defer();
    $scope.articleInitialized = deferred.promise;

    articleService.searchArticle(id, function (res) {
        $scope.actualArticle = res;
        deferred.resolve();
    });
});
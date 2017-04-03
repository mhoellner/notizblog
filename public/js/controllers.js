// nav bar controller
notizblogApp.controller('navbarCtrl', function ($scope, $cookies) {
    // show different things in menu if the user is logged in
    var user = $cookies.get('nbUser');
    if (user != null) {
        $('#loginNav').hide();
    } else {
        $('#userNav').hide();
    }

    // mark active menu item
    $scope.isActive = function (string) {
        var activePath = window.location.pathname + window.location.search;
        if (string == activePath) {
            return true;
        }
    }
});

// --- get data ---

// user controllers
notizblogApp.controller('usernameCtrl', function ($scope, $cookies) {
    $scope.username = $cookies.get('nbUser');
});

notizblogApp.controller('userFromArticleCtrl', function ($scope, userService) {
    $scope.articleInitialized
        .then(function (resolved) {
            var user = $scope.actualArticle.author;
            userService.searchUserByName(user, function (res) {
                $scope.user = res;
            });
        });
});

// article controllers
notizblogApp.controller('allArticlesCtrl', function ($scope, articleService) {
    articleService.allArticles(function (res) {
        $scope.articles = res;
    });
});

notizblogApp.controller('articleByIdCtrl', function ($scope, $q, articleService) {
    var id = getParamFromUrl(/^id/);

    if (id != null) {
        // make promise to do something after the variable is initialized
        var deferred = $q.defer();
        $scope.articleInitialized = deferred.promise;

        articleService.searchArticle(id, function (res) {
            $scope.actualArticle = res;
            // set promise here
            deferred.resolve();
        });
    }
});

// category controllers
notizblogApp.controller('allCategoriesCtrl', function ($scope, categoryService) {
    categoryService.allCategories(function (res) {
        $scope.categories = res;
    });
});

notizblogApp.controller('categoryByIdCtrl', function ($scope, categoryService) {
    var id = getParamFromUrl(/^category/);

    if (id != null) {
        categoryService.searchCategory(id, function (res) {
            $scope.actualCategory = res;
        });
    }
});

notizblogApp.controller('categoryFromArticleCtrl', function ($scope, categoryService) {
    $scope.articleInitialized
        .then(function (resolved) {
            var id = $scope.actualArticle.content.category;
            categoryService.searchCategory(id, function (res) {
                $scope.actualCategory = res;
            });
        });
});

// comments controllers
notizblogApp.controller('allCommentsCtrl', function ($scope, commentsService) {
    commentsService.allComments(function (res) {
        $scope.comments = res;
    });
});

// --- user management ---

notizblogApp.controller('loginCtrl', function ($scope, userService) {
    $scope.login = function () {
        userService.login($scope.user, function (resData) {
            if (resData == "0") {
                // login was successful
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

// --- article management (CUD of CRUD) ---

notizblogApp.controller('articleFormCtrl', function ($scope, $http, $cookies, $q) {
    if ($cookies.get('nbUser') != null) {
        $scope.saveArticle = function () {

            var fileData;
            var deferred = $q.defer();
            $scope.fileDataReady = deferred.promise;

            var picture = document.getElementById('input-picture').files[0];
            if (picture != null) {
                var reader = new FileReader(); // HTML5 File Reader
                reader.readAsDataURL(picture);
                reader.onload = function (theFileData) {
                    fileData = theFileData.target.result; // read result from FileReader
                    deferred.resolve();
                }
            } else {
                fileData = null;
                deferred.resolve();
            }

            $scope.fileDataReady
                .then(function (resolved) {
                    var jsonData = {
                        "content": $scope.article,
                        "picture": fileData,
                        "author": $cookies.get('nbUser')
                    };

                    $http.post('/newArticle', jsonData)
                        .then(function (res) {
                            if (res.status == 200) {
                                window.location = '/userSite';
                            }
                        }, function (res) {
                            if (res.status == 403) {
                                window.location = '/login';
                            }
                        });
                });
        }
    } else {
        // User must be logged in to write an article
        window.location = '/login';
    }
});

notizblogApp.controller('articleUpdateCtrl', function ($scope, $http, $cookies, $q) {
    // sets content to edit
    $scope.articleInitialized
        .then(function (resolved) {
            if ($cookies.get('nbUser') != null && $cookies.get('nbUser') == $scope.actualArticle.author) {
                $scope.article = {
                    title: $scope.actualArticle.content.title,
                    category: $scope.actualArticle.content.category,
                    text: $scope.actualArticle.content.text
                };
            } else {
                // User must be logged in to update an article
                window.location = '/login';
            }
        });

    $scope.updateArticle = function () {

        var fileData;

        // promise to do something after the file data is read
        var deferred = $q.defer();
        $scope.fileDataReady = deferred.promise;

        var picture = document.getElementById('input-picture').files[0];
        if (picture != null) {
            var reader = new FileReader(); // HTML5 File Reader
            reader.readAsDataURL(picture);
            reader.onload = function (theFileData) {
                fileData = theFileData.target.result; // read result from FileReader
                deferred.resolve();
            }
        } else {
            fileData = null;
            deferred.resolve();
        }

        $scope.fileDataReady
            .then(function (resolved) {
                var jsonData = {
                    "id": $scope.actualArticle.id,
                    "content": $scope.article,
                    "picture": fileData,
                    "author": $cookies.get('nbUser')
                };

                $http.post('/updateArticle', jsonData)
                    .then(function (res) {
                        if (res.status == 200) {
                            window.location = '/userSite';
                        }
                    }, function (res) {
                        if (res.status == 403) {
                            window.location = '/login';
                        }
                    });
            });
    };
});

notizblogApp.controller('articleDeleteCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.deleteArticle = function () {
        var canBeDeleted = confirm('Bist du dir sicher, dass du diesen Artikel löschen möchtest?\n\nEs gibt kein Zurück!');
        if (canBeDeleted) {
            var param = {
                "author": $scope.article.author,
                "articleID": $scope.article.id
            };
            $http.post('/deleteArticle', param)
                .then(function (res) {
                    if (res.status == 200) {
                        $('#articleTeaser-' + res.data[0].id)
                            .html('<hr><div class="alert alert-warning" role="alert">' +
                                'Der Artikel <b>' + res.data[0].content.title + '</b> wurde erfolgreich gelöscht.' +
                                '</div>');
                    }
                }, function (res) {
                    if (res.status == 401) {
                        alert('Du hast nicht das Recht diesen Artikel zu löschen.');
                    }
                });
        }
    };
}]);

// --- comment management ---

notizblogApp.controller('commentFormCtrl', function ($scope, $cookies, $http) {
    $scope.addComment = function () {

        console.log('Test');
        var author = $cookies.get('nbUser');

        var jsonData = {
            "author": author,
            "articleID": $scope.actualArticle.id,
            "comment": $scope.commentText,
            "ancestor": -1
        };

        var location = window.location;

        $http.post('/addComment', jsonData)
            .then(function (res) {
                window.location = location;
            })

    }

});

// --- functions ---
function getParamFromUrl(paramRegex) {
    var res = null;
    var params = window.location.search.substring(1);
    params = params.split('&');
    for (var i in params) {
        var string = params[i];
        if (string.search(paramRegex) != -1) {
            res = string.substring(string.indexOf("=") + 1);
            break;
        }
    }
    return res;
}
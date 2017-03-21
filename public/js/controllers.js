notizblogApp.controller('navbarCtrl', function ($scope, $http, $cookies) {
    $http.get('data/categories.json')
        .then(function (res) {
            $scope.categories = res.data;
        });

    // show different things in menu if the user is logged in
    var user = $cookies.get('nbUser');
    if (user != null) {
        document.getElementById('loginNav').style.display = 'none';
    } else {
        document.getElementById('userNav').style.display = 'none';
    }
});

notizblogApp.controller('loginCtrl', function ($scope, $http, $cookies) {
    $scope.login = function () {
        var jsonData = JSON.stringify($scope.user);
        $http.post('/login/login', jsonData)
            .then(function (res) {
                if (res.data == "0") {
                    // login ok
                    $cookies.put('nbUser', $scope.user.name);
                    window.location = "/userSite";
                } else if (res.data == "1") {
                    // wrong password
                    $('#loginError').html('<div class="alert alert-danger" role="alert">Falsches Passwort. Bitte versuche es erneut.</div>');
                    $scope.user.pwd = '';
                    $('#loginPwd').focus();
                } else if (res.data == "2") {
                    // user not found
                    $('#loginError').html('<div class="alert alert-danger" role="alert">Es wurde kein Nutzer mit diesem Nutzernamen gefunden. Bitte registriere dich.</div>');
                    $scope.user = '';
                    $('#loginName').focus();
                }
            });
    };
});

notizblogApp.controller('registerCtrl', function ($scope, $http, $cookies) {
    $scope.register = function () {
        var jsonData = JSON.stringify($scope.user);
        $http.post('/login/register', jsonData)
            .then(function (res) {
                if (res.data == "0") {
                    // register was successful
                    $cookies.put('nbUser', $scope.user.name);
                    window.location = "/userSite";
                } else if (res.data == "1") {
                    // passwords aren't equal
                    $('#registerError').html('<div class="alert alert-danger" role="alert">Passwörter stimmen nicht überein.</div>');
                    $scope.user.pwd = '';
                    $scope.user.pwd2 = '';
                    $('#registerPwd1').focus();
                } else if (res.data == "2") {
                    // user name already taken
                    $('#registerError').html('<div class="alert alert-danger" role="alert">Der Nutzername ist bereits vergeben.</div>');
                    $scope.user.pwd = '';
                    $scope.user.pwd2 = '';
                    $('#registerName').focus();
                } else if (res.data == "3") {
                    // account with email exists
                    $('#registerError').html('<div class="alert alert-danger" role="alert">Es existiert bereits ein Account mit dieser E-Mail-Adresse. Bitte melde dich an.</div>');
                    $scope.user = '';
                    $('#registerName').focus();
                }
            });
    };
});

notizblogApp.controller('categorySelectCtrl', function ($scope, $http) {
    $http.get('data/categories.json')
        .then(function (res) {
            $scope.categories = res.data;
        });
});

notizblogApp.controller('articleFormCtrl', function ($scope, $http, $cookies) {
    $scope.saveArticle = function () {
        var jsonData = JSON.stringify({"content": $scope.article, "author": $cookies.get('nbUser')});
        console.log(jsonData);
        $http.post('/newArticle', jsonData)
            .then();
    };
});
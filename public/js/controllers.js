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
                    alert("Dein Passwort war falsch.\nBitte versuche es noch einmal");
                    $scope.user.pwd = '';
                } else if (res.data == "2") {
                    // user not found
                    alert("Es wurde kein Nutzer mit diesem Nutzernamen gefunden\nBitte registriere dich.");
                    $scope.user = '';
                    window.location = "/login#register";
                }
            });
    };
});

notizblogApp.controller('registerCtrl', function ($scope, $http) {
    $scope.register = function () {
        var jsonData = JSON.stringify($scope.user);
        $http.post('/login/register', jsonData)
            .then(function (res) {
                console.log(res);
            });
    }
});
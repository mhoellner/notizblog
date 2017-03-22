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
});
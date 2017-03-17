notizblogApp.controller('navbarCtrl', function ($scope, $http) {
    $http.get('data/categories.json')
        .then(function (res) {
            $scope.categories = res.data;
        });
});

notizblogApp.controller('loginCtrl', function ($scope, $http) {
    $scope.login = function (data) {
        var jsonData = JSON.stringify($scope.user);
        console.log(jsonData);
        $http({
            url: 'http://localhost:3000/login/login',
            method: "POST",
            data: jsonData,
            header: 'Content-Type: application/json'
        }).then(function (res) {
            console.log(res);
        });
    };
});
notizblogApp.controller('navbarCtrl', function ($scope, $http, $document) {
    $http.get('data/categories.json')
        .then(function (res) {
            $scope.categories = res.data;
        });
});
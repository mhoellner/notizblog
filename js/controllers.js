notizblogApp.controller('navbarCtrl', function($scope, $http) {
   $http.get('data/categories.json').then(function (res) {
       $scope.categories = res.data;
   })
});
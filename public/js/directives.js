notizblogApp.directive('nbHeader', function factory() {
    return {
        priority: 0,
        scope: false,
        templateUrl: 'partials/header.html',
        restrict: 'E'
    }
});

notizblogApp.directive('nbMenu', function factory() {
    return {
        priority: 0,
        scope: false,
        templateUrl: 'partials/menu.html',
        restrict: 'E'
    }
});

notizblogApp.directive('nbArticleteaser', function factory() {
    return {
        priority: 0,
        scope: {
            article: '='
        },
        templateUrl: 'partials/articleTeaser.html',
        restrict: 'EA'
    }
});

notizblogApp.directive('nbComments', function factory() {
    return {
        priority: 0,
        scope: {
            actualComment: '=',
            allComments: '='
        },
        templateUrl: 'partials/comment.html',
        restrict: 'EA',
        controller: function ($scope, $http, $cookies) {
            $scope.subCommentForm = function () {
                $('#comment-' + $scope.actualComment.id).toggle();
            };

            $scope.addSubComment = function () {
                var author = $cookies.get('nbUser');

                var jsonData = {
                    "author": author,
                    "articleID": $scope.actualComment.article,
                    "comment": $scope.commentText,
                    "ancestor": $scope.actualComment.id
                };

                var location = window.location;

                $http.post('/addComment', jsonData)
                    .then(function (res) {
                        window.location = location;
                    })
            }
        }
    }
});
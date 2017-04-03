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
            comment: '='
        },
        templateUrl: 'partials/comment.html',
        restrict: 'EA'
    }
});
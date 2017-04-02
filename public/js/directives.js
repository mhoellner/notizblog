notizblogApp.directive('nbHeader', function factory() {
    return {
        priority: 0,
        scope: false,
        templateUrl: 'header.html',
        restrict: 'E'
    }
});

notizblogApp.directive('nbMenu', function factory() {
    return {
        priority: 0,
        scope: false,
        templateUrl: 'menu.html',
        restrict: 'E'
    }
});

notizblogApp.directive('nbArticleteaser', function factory() {
    return {
        priority: 0,
        scope: {
            article: '='
        },
        templateUrl: 'articleTeaser.html',
        restrict: 'EA'
    }
});
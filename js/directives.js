notizblogApp.directive('nbHeader', function factory() {
    return {
      priority: 0,
      scope: false,
      templateUrl: 'header.html',
      restrict: 'E',
      controller: function() {}
    }
  });

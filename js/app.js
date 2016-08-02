angular.module("myapp", []).controller("HelloController", function($scope) {

  $scope.json = {};
  $scope.json.parsedJson = '{}';

  $scope.update = function(json) {
    try {
      var startingPosition = json.sourceText.length;
      var startingMatch;
      var sourceText = json.sourceText;
      sourceText = sourceText.split('\n').join(' ');
      ['{(.+)}', '\\[(.+)\\]'].forEach(function(expression) {
        var matches = sourceText.match(expression);
        if (matches) {
          if (matches.index < startingPosition) {
            startingPosition = matches.index;
            startingMatch = matches
          }
        }
      });
      if (startingMatch) {
        sourceText = startingMatch[0].split('\\"').join('"');
        json.extractedJson = sourceText;
      } else {
        json.extractedJson = 'No JSON found, will attempt to parse anyways...';
      }
      var jsonString = JSON.stringify(JSON.parse(sourceText), function(key, value) {
        if (typeof value === 'string') {
          value = decodeURIComponent(value);
        }
        return value;
      }, 3);
      json.parsedJson = jsonString;
    } catch (exception) {
      json.parsedJson = exception.message;
    }
  };

});

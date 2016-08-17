angular.module("myapp", []).controller("HelloController", function($scope) {

  $scope.json = {};
  $scope.json.parsedJson = '{}';

  $scope.extractJsonText = function(text, removeSlashes) {
    text = text.split('\n').join(' ');
    var startingMatch, startingPosition = text.length;
    ['{(.+)}', '\\[(.+)\\]'].forEach(function(expression) {
      var matches = text.match(expression);
      if (matches) {
        if (matches.index < startingPosition) {
          startingPosition = matches.index;
          startingMatch = matches
        }
      }
    });
    if (startingMatch) {
      text = startingMatch[0].split('\\"').join('"');
      if (removeSlashes) {
        text = text.split('\\').join('');
      }
    }
    return text;
  };

  $scope.update = function(json) {
    json.working = true;
    clearTimeout($scope.sweatingTimeout);
    $scope.sweatingTimeout = setTimeout(function() {
      $scope.$apply(function () {
        $scope.json.working = false;
      });
    }.bind(this), 500);
    try {
      sourceText = this.extractJsonText(json.sourceText, true);
      json.extractedJson = sourceText;
      var subJsons = [];
      var jsonString = JSON.stringify(JSON.parse(sourceText), function(key, value) {
        if (typeof value === 'string') {
          value = decodeURIComponent(value);
          var jsonText = this.extractJsonText(value);
          if (value != jsonText) {
            subJsons.push(jsonText);
            value = value.replace(jsonText, '%JSON_' + subJsons.length + '%');
          }
        }
        return value;
      }.bind(this), 3);
      if (subJsons.length > 0) {
        console.log(jsonString);
        subJsons.forEach(function(subJson, index) {
          console.log(subJson);
          jsonString = jsonString.replace('%JSON_' + (index + 1) + '%', JSON.stringify(JSON.parse(subJson), null, 3));
        }.bind(this));
      }
      json.parsedJson = jsonString;
    } catch (exception) {
      json.parsedJson = exception.message;
    }
  };

});

angular.module("JsonPrintApp", ['ngRoute'])

  .controller("JsonPrintController", function($scope) {

    $scope.json = {};
    $scope.json.showSurroundingText = false;
    $scope.json.parsedJson = '';
  
    $scope.extractJsonObjects = function(text) {
      var results = [];
      var braceCount = 0;
      var candidate = '';
      if (typeof text === 'string') {
        text.split('').forEach(function(character) {
          switch (character) {
            case '{':
              if (braceCount == 0) {
                results.push(candidate);
                candidate = '';
              }
              braceCount++;
              candidate += character;
              break;
            case '}':
              braceCount--;
              candidate += character;
              if (braceCount == 0) {
                candidate = candidate.split('\\"').join('"');
                try {
                  candidate = JSON.stringify(JSON.parse(candidate), function(key, value) {
                    if (typeof value === 'string') {
                      value = decodeURIComponent(value);
                      var objects = this.extractJsonObjects(value);
                      if (objects.length > 0) {
                        return objects;
                      }
                    }
                    return value;
                  }.bind(this), 3);
    
                  results.push(JSON.parse(candidate));
                } catch(exception) {
                  console.log(exception);
                }
                candidate = '';
              }
              break;
            default:
              candidate += character;
              break;
          }
        }.bind(this));
      }
      return results;
    };
  
    $scope.update = function(json) {
      json.working = true;
      
      // fake timer just to show something's changed
      clearTimeout($scope.sweatingTimeout);
      $scope.sweatingTimeout = setTimeout(function() {
        $scope.$apply(function () {
          $scope.json.working = false;
        });
      }.bind(this), 500);
  
      var objects = this.extractJsonObjects(json.sourceText);
      json.parsedJson = '';
      objects.forEach(function(object) {
        if (typeof object === 'string') {
          if (json.showSurroundingText) {
            json.parsedJson += object;
          }
        } else {
          json.parsedJson += JSON.stringify(object, null, 3);
        }
      }.bind(this));
    };
  
  });

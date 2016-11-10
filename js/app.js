angular.module("JsonPrintApp", ['ngRoute'])

  .controller("JsonPrintController", function($scope) {

    $scope.json = {};

    // include non-JSON text in parsed results?
    $scope.json.showSurroundingText = false;

    // parsed results
    $scope.json.parsedJson = '';

    /**
     * Parse a string into a JSON object. If the first attempt fails, try to convert escaped quotes
     * to normal quotes and try again.
     * @param {string} text The string to convert
     * @returns {object}
     */
    $scope.parse = function(text) {
      try {
        return JSON.parse(text);
      } catch (exception) {
        console.log(exception);
      }
      text = text.split('\\"').join('"');
      try {
        return JSON.parse(text);
      } catch (exception) {
        console.log(exception);
      }
    };
 
    /**
     * Given a string, attempt to find a JSON-like object. Called recursively to find any parsed string values
     * that might also be JSON-like objects.
     * @param {string} text The string to examine
     * @param {number} depth The current recursion depth
     * @returns {Array} An array of strings and/or objects found in the given text
     */ 
    $scope.extractJsonObjects = function(text, depth) {
      depth = (typeof depth === 'undefined') ? 0 : depth;
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
                try {
                  // attempt to parse the candidate JSON string as JSON, checking each parsed value
                  // to see if it, too, is a JSON string
                  candidate = JSON.stringify(this.parse(candidate), function(key, value) {
                    if (typeof value === 'string') {
                      value = decodeURIComponent(value);
                      var objects = this.extractJsonObjects(value, depth + 1);
                      if (objects.length > 0) {
                        return objects;
                      }
                    }
                    return value;
                  }.bind(this), 3);
                  results.push(JSON.parse(candidate));
                } catch(exception) {
                  // Unexpected token p in JSON at position 2872
                  var matches = exception.message.match(/Unexpected token (.+?) in JSON at position (\d+)/);
                  if (matches) {
                    console.log('TOKEN', matches[1]);
                    console.log('POSITION', matches[2]);
                    console.log('CONTEXT', candidate.substring(matches[2]));
                  }
                  // TODO: maybe add the parse exception to the results in some way
                  console.log(exception.message);
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
      // if this is the first entrance into this routine, add any remaining characters to the results as
      // a string for potential display in the json results
      if (depth === 0 && candidate.length > 0) {
        results.push(candidate);
      }
      return results;
    };
 
    /**
     * Called when the source text is changed. Attempts to extract JSON object(s) from the source text
     * and update the parsed results.
     * @param {object} json The app's json object
     */ 
    $scope.update = function(json) {
      json.working = true;
      
      // fake timer just to show something's changed
      clearTimeout($scope.sweatingTimeout);
      $scope.sweatingTimeout = setTimeout(function() {
        $scope.$apply(function () {
          $scope.json.working = false;
        });
      }.bind(this), 500);
 
      // find any JSON objects and update the parsed results
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

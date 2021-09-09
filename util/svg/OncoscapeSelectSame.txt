/*
SelectSameOncoscape.js
----------------------
A script for Adobe Illustrator.
If user has selected one object from an Oncoscape SVG export,
use this script to allow selection of all objects that match
certain Oncoscape metadata properties.

The properties are stored as a string of key-value pairs, in the
SVG object's "id" attribute.  For example:
		patientId:3223745.type:pet.subtype:positive.style:symbol.i:2
		
This has five key-value pairs, separated by a period. The script
presents these to the user, who can then delete or change some
of the constraints, to form the query they want. Clicking "OK"
will then select all SVG objects whose metadata matches the query.

*/

var activeDoc = app.activeDocument
var selection = activeDoc.selection

 
// polyfill for string.trim
if (!String.prototype.trim) {
    (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}

//polyfill
var JSONparse = function(text, reviver) {

	// The parse method takes a text and an optional reviver function, and returns
	// a JavaScript value if the text is a valid JSON text.

	var j;
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
   
	function walk(holder, key) {

		// The walk method is used to recursively walk the resulting structure so
		// that modifications can be made.

		var k;
		var v;
		var value = holder[key];
		if (value && typeof value === "object") {
			for (k in value) {
				if (Object.prototype.hasOwnProperty.call(value, k)) {
					v = walk(value, k);
					if (v !== undefined) {
						value[k] = v;
					} else {
						delete value[k];
					}
				}
			}
		}
		return reviver.call(holder, key, value);
	}


	// Parsing happens in four stages. In the first stage, we replace certain
	// Unicode characters with escape sequences. JavaScript handles many characters
	// incorrectly, either silently deleting them, or treating them as line endings.

	text = String(text);
	rx_dangerous.lastIndex = 0;
	if (rx_dangerous.test(text)) {
		text = text.replace(rx_dangerous, function(a) {
			return (
				"\\u" +
				("0000" + a.charCodeAt(0).toString(16)).slice(-4)
			);
		});
	}

	// In the second stage, we run the text against regular expressions that look
	// for non-JSON patterns. We are especially concerned with "()" and "new"
	// because they can cause invocation, and "=" because it can cause mutation.
	// But just to be safe, we want to reject all unexpected forms.

	// We split the second stage into 4 regexp operations in order to work around
	// crippling inefficiencies in IE's and Safari's regexp engines. First we
	// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
	// replace all simple value tokens with "]" characters. Third, we delete all
	// open brackets that follow a colon or comma or that begin the text. Finally,
	// we look to see that the remaining characters are only whitespace or "]" or
	// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

	if (
		rx_one.test(
			text
			.replace(rx_two, "@")
			.replace(rx_three, "]")
			.replace(rx_four, "")
		)
	) {

		// In the third stage we use the eval function to compile the text into a
		// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
		// in JavaScript: it can begin a block or an object literal. We wrap the text
		// in parens to eliminate the ambiguity.

		j = eval("(" + text + ")");

		// In the optional fourth stage, we recursively walk the new structure, passing
		// each name/value pair to a reviver function for possible transformation.

		return (typeof reviver === "function") ?
			walk({
				"": j
			}, "") :
			j;
	}

	// If the text is not JSON parseable, then a SyntaxError is thrown.

	throw new SyntaxError("JSONparse");
};

// polyfill for Object.keys
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

// polyfill for Array.indexOf.  From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill 
if (!Array.prototype.indexOf)
  Array.prototype.indexOf = (function(Object, max, min) {
    "use strict"
    return function indexOf(member, fromIndex) {
      if (this === null || this === undefined)
        throw TypeError("Array.prototype.indexOf called on null or undefined")

      var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len)
      if (i < 0) i = max(0, Len + i)
      else if (i >= Len) return -1

      if (member === void 0) {        // undefined
        for (; i !== Len; ++i) if (that[i] === void 0 && i in that) return i
      } else if (member !== member) { // NaN
        return -1 // Since NaN !== NaN, it will never be found. Fast-path it.
      } else                          // all else
        for (; i !== Len; ++i) if (that[i] === member) return i 

      return -1 // if the value was not found, then return -1
    }
  })(Object, Math.max, Math.min)

//polyfill for stringify. From https://gist.github.com/cookiengineer/05581bc59f5d7d3dbaa09e6018678740
	const _INDENT     = '    ';
	const _WHITESPACE = '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ';
	//new Array(512).fill(' ').join('');
	const _format_date = function(n) {
		return n < 10 ? '0' + n : '' + n;
	};	
	const _stringify = function(data, indent) {

		indent = typeof indent === 'string' ? indent : '';


		var str = '';

		if (
			typeof data === 'boolean'
			|| data === null
			|| data === undefined
			|| (
				typeof data === 'number'
				&& (
					data === Infinity
					|| data === -Infinity
					|| isNaN(data) === true
				)
			)
		) {

			if (data === null) {
				str = indent + 'null';
			} else if (data === undefined) {
				str = indent + 'undefined';
			} else if (data === false) {
				str = indent + 'false';
			} else if (data === true) {
				str = indent + 'true';
			} else if (data === Infinity) {
				str = indent + 'Infinity';
			} else if (data === -Infinity) {
				str = indent + '-Infinity';
			} else if (isNaN(data) === true) {
				str = indent + 'NaN';
			}

		} else if (typeof data === 'number') {

			str = indent + data.toString();

		} else if (typeof data === 'string') {

			str = indent + '"' + data + '"';

		} else if (typeof data === 'function') {

			var body   = data.toString().split('\n');
			var offset = 0;

			var first = body.find(function(ch) {
				return ch.startsWith('\t');
			}) || null;

			if (first !== null) {

				var check = /(^\t+)/g.exec(first);
				if (check !== null) {
					offset = Math.max(0, check[0].length - indent.length);
				}

			}


			for (var b = 0, bl = body.length; b < bl; b++) {

				var line = body[b];
				if (line.startsWith('\t')) {
					str += indent + line.substr(offset);
				} else {
					str += indent + line;
				}

				str += '\n';

			}

		} else if (data instanceof Array) {
			str += ' <<ARRAY TBD>> ';

		} else if (data instanceof Date) {

			str  = indent;

			str += data.getUTCFullYear()                + '-';
			str += _format_date(data.getUTCMonth() + 1) + '-';
			str += _format_date(data.getUTCDate())      + 'T';
			str += _format_date(data.getUTCHours())     + ':';
			str += _format_date(data.getUTCMinutes())   + ':';
			str += _format_date(data.getUTCSeconds())   + 'Z';

		} else if (data instanceof Object) {

			var keys = Object.keys(data);
			if (keys.length === 0) {

				str = indent + '{}';

			} else {

				str  = indent;
				str += '{\n';

				for (var k = 0, kl = keys.length; k < kl; k++) {

					var key = keys[k];

					str += '\t' + indent + '"' + key + '": ';
					str += _stringify(data[key], '\t' + indent);

					if (k < kl - 1) {
						str += ',';
					}

					str += '\n';

				}

				str += indent + '}';

			}

		}


		return str;

	};
	
var parseToObject = function(query) {
	var q = {};
	var kvps = query.split('.');
	for(var i=0 ; i < kvps.length; i++) {
		var parts = kvps[i].split(':');
		q[parts[0]] = parts[1];
	}
	return q;
}
var matchesProps = function(queryObj, testObj) {
	var success = true;
	var queryKeys = Object.keys(queryObj);
	for(var i=0; i < queryKeys.length; i++) {
		var queryKey = queryKeys[i];
		var testKeys = Object.keys(testObj);
		if (testObj[queryKey] == queryObj[queryKey]) {
			// alert('success ' + queryKey + ' of ' + testObj[queryKey] + '!');
		} else {
			//alert('failure ' + queryKey + '!');
			success = false;
		}
	}
	return success;
}	
var selectAllMatches = function(query) {
	var q = parseToObject(query);
	item.selected = false;
	var numMatches = 0;
	for(var i = 0; i < documents[0].pathItems.length; i++){
		var loopItem = documents[0].pathItems[i];
		if (loopItem.name && loopItem.name.indexOf(':',1) > -1) {
			var testObject = parseToObject(loopItem.name);
			if(matchesProps(q, testObject)) {
				loopItem.selected = true; 
				numMatches++;
			}
		}
	}
	alert('Selected ' + numMatches + ' objects.');
}
	
alert('Select SAME...');
// check if anything is selected
if (selection.length == 1) {
	var item = selection[0]; 
	alert(item);
	alert(item.name);
	if (item.name && item.name.indexOf(':',1) > -1) {
		// Format is id= "color:red.size:large".  Other valid chars are _ and - as separators.
		var input = item.name;
		query = prompt('Loosen the selection criteria.', input);
		if (query != null) {
			if(query == input) {
				alert("You need to loosen the selection criteria, or you only end up selecting the one object you've already selected.");
			} else {
				selectAllMatches(query);
			}
		}
	} else {
		alert('That object does not have any searchable Oncoscape properties.');
	}
} else {
  alert('Select one object before running this script')
}

  

// From https://github.com/douglascrockford/JSON-js/blob/master/json2.js

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

var _slicedToArray = (function() {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance"
      );
    }
  };
})();

function _toArray(arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
}

function merge(a, b) {
  return Object.entries(a).reduce(function(res, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      val = _ref2[1];

    return _extends({}, res, {
      [key]: typeof res[key] === "object" ? merge(res[key], val) : val
    });
  }, b);
}

if (!Object.entries)
  Object.entries = function(obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };

var Zap = {
  update_pre_write: function update_pre_write(bundle) {
    var myRecord = {};
    var data = bundle.action_fields_full.record;
    data = resolveJSONPaths(data);
    var supported = ["object", "number", "boolean", "string"];
    function tryType(o, f) {
      switch (f) {
        case "boolean":
          var b = o.toLowerCase();
          if (b !== "true" && b !== "false") {
            throw "not a boolean";
          }
          return JSON.parse(b);
        case "object":
          var s;
          if (o.match(/[^\d],/g)) {
            s = o.split(/,(?! )/);
          }
          if (o.startsWith("{") || o.startsWith("[")) {
            return JSON.parse(
              o
                .replace(/([a-zA-Z0-9]+?):(["'\s]+)/g, '"$1":$2')
                .replace(/'/g, '"')
            );
          } else if (s.length > 1) {
            return s;
          } else {
            throw "not an object";
          }
        case "number":
          var n = o.replace(/(\d),(\d)/g, "$1$2");
          if (isNaN(n)) {
            throw "not a number";
          }
          return n * 1;
        case "string":
          if (typeof o === undefined || o === null) break;
          return o;
        default:
          break;
      }
    }

    Object.keys(data).forEach(function(key, index) {
      function upgradeFormat() {
        for (var i = 0; i < supported.length; i++) {
          try {
            return tryType(data[key], supported[i]);
          } catch (error) {
            console.log(error);
          }
        }
      }
      myRecord[key] = upgradeFormat();
    });

    function resolveJSONPaths(input) {
      if (typeof input === "string") {
        return input;
      }
      if (Array.isArray(input)) {
        return input.map(resolveJSONPaths);
      }
      return Object.entries(input).reduce(function(acc, cur) {
        var _cur = _slicedToArray(cur, 2),
          key = _cur[0],
          value = _cur[1];

        if (key.includes(".")) {
          var _key$split = key.split("."),
            _key$split2 = _toArray(_key$split),
            firstPath = _key$split2[0],
            paths = _key$split2.slice(1);

          if (acc[firstPath] === undefined) {
            acc[firstPath] = {};
          }
          acc[firstPath] = merge(
            acc[firstPath],
            resolveJSONPaths({ [paths.join(".")]: value })
          );
        } else {
          acc[key] = resolveJSONPaths(value);
        }
        return acc;
      }, {});
    }

    myRecord = JSON.stringify(myRecord);

    return {
      url: bundle.request.url,
      method: bundle.request.method,
      auth: bundle.request.auth,
      headers: bundle.request.headers,
      params: bundle.request.params,
      data: myRecord
    };
  }
};

module.exports = Zap;

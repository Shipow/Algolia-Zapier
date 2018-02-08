var Zap = {
  update_pre_write: function(bundle) {
    var myRecord = {};
    var data = bundle.action_fields_full.record;
    var data = resolveJSONPaths(data);
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
          if (o.match(/[^\d]\,/g)) {
            var s = o.split(/\,(?! )/);
          }
          if (o.startsWith("{") || o.startsWith("[")) {
            return JSON.parse(
              o
                .replace(/([a-zA-Z0-9]+?):([\"\'\s]+)/g, '"$1":$2')
                .replace(/'/g, '"')
            );
          } else if (s.length > 1) {
            return s;
          } else {
            throw "not an object";
          }
          break;
        case "number":
          var n = o.replace(/(\d)\,(\d)/g, "$1$2");
          if (isNaN(n)) {
            throw "not a number";
          }
          return n * 1;
        case "string":
          if (typeof o === undefined || o === null) break;
          return o;
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
      return Object.entries(input).reduce((acc, cur) => {
        const [key, value] = cur;
        if (key.includes(".")) {
          const [firstPath, ...paths] = key.split(".");
          if (acc[firstPath] === undefined) {
            acc[firstPath] = {};
          }
          acc[firstPath] = $.extend(
            true,
            {},
            acc[firstPath],
            resolveJSONPaths({ [paths.join(".")]: value })
          );
        } else {
          acc[key] = resolveJSONPaths(value);
        }
        return acc;
      }, {});
    }

    //myRecord = JSON.stringify(resolveJSONPaths(myRecord));
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

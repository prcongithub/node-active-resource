module.exports = function(options) {
  module.exports.config = options;
  var Resource = require("./lib/resource");
  module.exports.Resource = new Resource();
};


var NodeActiveResource = module.exports = function(options) {
  module.exports.config = options;
  var Resource = require("./lib/resource");
  module.exports.Resource = Resource;
};





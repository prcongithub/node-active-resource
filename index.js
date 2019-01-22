var NodeActiveResource = module.exports = function(options) {
  module.exports.config = options;
  var Resource = require("./lib/resource")(options);
  module.exports.Resource = Resource;
};





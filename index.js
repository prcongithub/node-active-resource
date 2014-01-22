var Resources = require("./lib/resources");

var Vger = module.exports = function (options) {
  return function (req, res, next) {
    next();
  };
};

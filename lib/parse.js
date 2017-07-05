var _ = require("underscore");
var _s = require("underscore.string");

module.exports.parse = function(parentClass,response) {
  var object = new Object();
  _.each(response, function(value, key) {
    if(value == null || value == undefined) {
      object[key] = null;
    } else {
      if(_.isArray(value)){ 
        if(parentClass.hasMany && parentClass.hasMany[key]) {
          var asssociationKlass = parentClass.hasMany[key]['klass'];
          object[key] = [];
          _.each(value, function(asssociationHash) {
            var asssociationObject = new asssociationKlass(asssociationHash);
            object[key].push(asssociationObject);
          });
        } else {
          object[key] = value;
        }
      } else if (_.keys(value).length > 0) {
        if(parentClass.hasOne && parentClass.hasOne[key]) {
          var asssociationKlass = parentClass.hasOne[key]['klass'];
          var asssociationObject = new asssociationKlass(value);
          object[key] = asssociationObject;
        } else {
          object[key] = value;
        }
      } else {
        object[key] = value;
      }
    }
  });
  return object;
}

var _ = require("underscore");

var Paths = {
  generateURL: function(url, conditions){
    var path = url;
    var parts = path.match(/\:\w+/g);
    _.each(parts,function(part){
      var attrib = part.split(':')[1];
      var value  = typeof(conditions[attrib]) === 'function' ? conditions[attrib]() : conditions[attrib];
      if(value) {
        path = path.replace(part,value);
      } else {
        throw new Error("Missing attribute "+attrib+"");
      }
    });
    return path;
  },
  generatePathParams: function(object, options) {
    var pathParams = {};
    var parts = options.url.match(/\:\w+/g);
    _.each(parts,function(part){
      var attrib = part.split(':')[1];
      var value = null;
      if(attrib == object.root()+"_id") {
        value  = object[object.constructor.idAttribute];
      } else {
        value  = typeof(object[attrib]) === 'function' ? object[attrib]() : object[attrib];
      }
      if(value) {
        pathParams[attrib] = value;
      } else {
        throw new Error("Missing attribute "+attrib+" for "+object);
      }
    });
    return pathParams;
  }
}
module.exports = Paths;

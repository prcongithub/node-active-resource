var _ = require("underscore");

var Paths = {
  generateURL: function(url, conditions){
    var path = url;
    var parts = path.match(/\:\w+/g);
    _.each(parts,function(part){
      var attrib = part.split(':')[1];
      var value  = conditions[attrib];
      if(value) {
        path = path.replace(part,value);
      } else {
        throw new Error("Missing attribute "+attrib+"");
      }
    });
    return path;
  }
}
module.exports = Paths;

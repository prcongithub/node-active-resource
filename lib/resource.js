var nodeVger = require('../index');
var Http = require('./http').Http;
var http = new Http(nodeVger.config);
var extend = require("extend");
var Resource = function(){
};

Resource.define_resource = function(options){
  var Class = function(){
  };
  Class.prototype = Resource.prototype;
  return extend(true, Class,Resource,options);
};

Resource.fetch = function(callback){
  http.api_request(this.collectionPath, callback);
};

Resource.collectionPath = function(){
  throw new Error("Collection path is not specified.");
};

Resource.prototype = {
  constructor: Resource,
  save: function(){
    console.log("Saving resource...");
  }
}

module.exports = Resource;

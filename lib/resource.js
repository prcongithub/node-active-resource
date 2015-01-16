var extend = require("extend");
var _ = require("underscore");
var _s = require("underscore.string");
var Qs = require('qs');
var nodeVger = require('../index');
var Http = require('./http').Http;
var http = new Http(nodeVger.config);
var Scope = require("./scope");
var Paths = require("./paths");
var Resource = function(){
  this.conditions = {};
};

Resource.define_resource = function(options){
  var Class = function(){
    extend(true,this,arguments[0]);
  };
  var Klass = extend(true, Class,Resource,options)
  Klass.prototype = extend({}, Resource.prototype);
  Klass.prototype.constructor = Klass;
  return Klass;
};

Resource.customPost = function(options){
  return function(conditions, post_data, callback){
    var conditions = conditions ? conditions : {};
    var uri = Paths.generateURL(options.url, conditions) + "?" + Qs.stringify(conditions, { indices: false });
    var root = this.root();
    var post_data = Qs.stringify(post_data, { indices: true });
    var klass = this;
    http.post(uri, post_data, function(response){
      var object = new klass(response);
      callback(object);
    });
  }
};

Resource.customPut = function(options){
  return function(conditions, post_data, callback){
    var conditions = conditions ? conditions : {};
    var uri = Paths.generateURL(options.url, conditions) + "?" + Qs.stringify(conditions, { indices: false });
    var root = this.root();
    var post_data = Qs.stringify(post_data, { indices: true });
    var klass = this;
    http.put(uri, post_data, function(response){
      var object = new klass(response);
      callback(object);
    });
  }
};

Resource.customGet = function(options){
  return function(conditions, callback){
    var conditions = conditions ? conditions : {};
    var uri = Paths.generateURL(options.url, conditions) + "?" + Qs.stringify(conditions, { indices: false });
    var root = this.root();
    var klass = this;
    http.get(uri, function(response){
      var object = new klass(response);
      callback(object);
    });
  }
};

Resource.resourceName = function(){
  throw new Error("Resource Name is not specified.");
};

Resource.collectionPath = function(){
  throw new Error("Collection path is not specified.");
};

Resource.find = function(id, callback) {
  this.scope = new Scope(this, {});
  return this.scope.find(id, callback);
};

Resource.where = function(conditions){
  this.scope = new Scope(this, conditions);
  return this.scope;
};

Resource.create = function(conditions, attributes, callback){
  var conditions = conditions ? conditions : {};
  var uri = this.requestPath(conditions) + "?" + Qs.stringify(conditions, { indices: false });
  var root = this.root();
  var object = {};
  object[root] = attributes;
  var post_data = Qs.stringify(object, { indices: true });
  var klass = this;
  http.post(uri, post_data, function(response){
    var object = new klass(response);
    callback(object);
  });
};

Resource.all = function(callback){
  this.scope = new Scope(this, {});
  return this.scope.all(callback);
};

Resource.root = function(){
  return _s.underscored(this.resourceName);
};

Resource.requestPath = function(conditions){
  return Paths.generateURL(this.collectionPath, conditions);
};

Resource.prototype.root = function(){
  return this.constructor.root();
};

Resource.prototype.collectionPath = function(){
  return this.constructor.requestPath(this.conditions);
};
  
Resource.prototype.save = function(conditions, attributes, callback){
  this.conditions = conditions ? conditions : {};
  var uri = this.collectionPath() + "/" + this.id + "?" + Qs.stringify(this.conditions, { indices: false });
  var root = this.root();
  var object = {};
  object[root] = attributes;
  var post_data = Qs.stringify(object, { indices: true });
  var klass = this.constructor;
  http.put(uri, post_data, function(response){
    var object = new klass(response);
    callback(object);
  });
}

module.exports = Resource;

var extend = require("extend");
var _ = require("underscore");
var _s = require("underscore.string");
var Qs = require('qs');
var nodeVger = require('../index');
var Http = require('./http').Http;
var http = new Http(nodeVger.config);
var Scope = require("./scope");
var Paths = require("./paths");
var Parse = require("./parse");
var Resource = function(){
  this.conditions = {};
};

Resource.idAttribute = "id";

Resource.define_resource = function(options){
  var Class = function(){
    var hash = Parse.parse(this.constructor,arguments[0]);
    extend(true,this,hash);
    this.id = this[this.constructor.idAttribute];
  };
  var Klass = extend(true, Class,Resource,options)
  Klass.prototype = extend({},Resource.prototype, options.prototype);
  Klass.prototype.constructor = Klass;
  return Klass;
};

Resource.define_association = function(options){
  return function(request, conditions, callback){
    var conditions = conditions ? conditions : {};
    var pathParams = Paths.generatePathParams(this, options);
    var uri = Paths.generateURL(options.url, pathParams) + 
              "?" + 
              Qs.stringify(conditions, { arrayFormat: 'brackets' });
    var klass = options.klass;
    var root = klass.root();
    http.get(request, uri, function(response, error){
      if(error) {
        callback(response,error);
      } else {
        if(_.isArray(response)){
          var array = [];
          _.each(response, function(data){
            array.push(new klass(data));
          });
          callback(array,error);
        } else {
          var object = new klass(response);
          callback(object,error);
        }
      }
    });
  }
}

Resource.customPost = function(options){
  return function(request, conditions, post_data, callback){
    var conditions = conditions ? conditions : {};
    var uri = Paths.generateURL(options.url, conditions) + 
              "?" + 
              Qs.stringify(conditions, { arrayFormat: 'brackets' });
    var root = this.root();
    var post_data = Qs.stringify(post_data, { arrayFormat: 'brackets' });
    var klass = this;
    http.post(request, uri, post_data, function(response,error){
      var object = new klass(response);
      callback(object,error);
    });
  }
};

Resource.customPut = function(options){
  return function(request, conditions, post_data, callback){
    var conditions = conditions ? conditions : {};
    var uri = Paths.generateURL(options.url, conditions) + 
              "?" + 
              Qs.stringify(conditions, { arrayFormat: 'brackets' });
    var root = this.root();
    var post_data = Qs.stringify(post_data, { arrayFormat: 'brackets' });
    var klass = this;
    http.put(request, uri, post_data, function(response,error){
      var object = new klass(response);
      callback(object,error);
    });
  }
};

Resource.customGet = function(options){
  return function(request, conditions, callback){
    var conditions = conditions ? conditions : {};
    var uri = Paths.generateURL(options.url, conditions) + 
              "?" + 
              Qs.stringify(conditions, { arrayFormat: 'brackets' });
    var root = this.root();
    var klass = this;
    http.get(request, uri, function(response, error){
      var object = new klass(response);
      callback(object,error);
    });
  }
};

Resource.resourceName = function(){
  throw new Error("Resource Name is not specified.");
};

Resource.collectionPath = function(){
  throw new Error("Collection path is not specified.");
};

Resource.find = function(request, id, conditions, callback) {
  this.scope = new Scope(this, conditions);
  return this.scope.find(request, id, callback);
};

Resource.where = function(conditions){
  this.scope = new Scope(this, conditions);
  return this.scope;
};

Resource.create = function(request, conditions, attributes, callback){
  var conditions = conditions ? conditions : {};
  var uri = this.requestPath(conditions) + 
            "?" + 
            Qs.stringify(conditions, { arrayFormat: 'brackets' });
  var root = this.root();
  var object = {};
  object[root] = attributes;
  var post_data = Qs.stringify(object, { arrayFormat: 'brackets' });
  var klass = this;
  http.post(request, uri, post_data, function(response,error){
    var object = new klass(response);
    callback(object,error);
  });
};

Resource.all = function(request, callback){
  this.scope = new Scope(this, {});
  return this.scope.all(request, callback);
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

Resource.prototype.save = function(request, conditions, attributes, callback){
  this.conditions = conditions ? conditions : {};
  var uri = this.collectionPath() + "/" + this.id + 
            "?" + 
            Qs.stringify(this.conditions, { arrayFormat: 'brackets' });
  var root = this.root();
  var object = {};
  object[root] = attributes;
  var post_data = Qs.stringify(object, { arrayFormat: 'brackets' });
  var klass = this.constructor;
  http.put(request, uri, post_data, function(response,error){
    var object = new klass(response);
    callback(object,error);
  });
}

module.exports = Resource;

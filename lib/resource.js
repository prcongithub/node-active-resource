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
Resource.include_root_in_json = true;

Resource.define_resource = function(options){
  var Class = function(){
    var hash = arguments[0] || {};
    var rootPresent = Object.keys(hash).includes(this.root());
    if(this.constructor.include_root_in_json && rootPresent) {
      hash = hash[Object.keys(hash)]
    }
    hash = Parse.parse(this.constructor,hash);
    extend(true,this,hash);
    var parts = this.constructor.idAttribute.split(".");  
    var object = _.clone(this);    
    this.id = _.reduce(parts, function(_id, part){
      _id = _id || {};
      return _id[part];
    }, object);
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
          array.pagination = response.pagination;
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

Resource.customMemberGet = function(options){
  return function(request, conditions, callback){
    var conditions = conditions ? conditions : {};
    var pathParams = Paths.generatePathParams(this, options);
    var uri = Paths.generateURL(options.url, pathParams) + 
              "?" + 
              Qs.stringify(conditions, { arrayFormat: 'brackets' });
    var root = this.root();
    var klass = this.constructor;
    http.get(request, uri, function(data, error){
      if(error) {
        callback(null, error);
      } else {
        if(_.isArray(data)) {
          if(data.length > 0) {
            var arr = [];
            _.each(data, function(data){
              var object = new klass(data);
              arr.push(object);
            });
            arr.pagination = data.pagination;
            callback(arr, error);
          } else {
            callback(data, error);
          }
        } else {
          var object = new klass(data);
          callback(object,error);
        }
      }
    });
  }
};

Resource.customMemberPost = function(options){
  return function(request, conditions, attributes, callback){
    var conditions = conditions ? conditions : {};
    var pathParams = Paths.generatePathParams(this, options);
    var uri = Paths.generateURL(options.url, pathParams) + 
              "?" + 
              Qs.stringify(conditions, { arrayFormat: 'brackets' });
    var root = this.root();
    var object = {};
    object[root] = attributes;
    var post_data = Qs.stringify(object, { arrayFormat: 'brackets' });
    var klass = this.constructor;
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
    http.get(request, uri, function(data, error){
      if(error) {
        callback(null, error);
      } else {
        if(_.isArray(data)) {
          if(data.length > 0) {
            var arr = [];
            _.each(data, function(data){
              var object = new klass(data);
              arr.push(object);
            });
            arr.pagination = data.pagination;
            callback(arr, error);
          } else {
            callback(data, error);
          }
        } else {
          var object = new klass(data);
          callback(object,error);
        }
      }
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
  return _s.underscored(_.last(this.resourceName.split('::')));
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

Resource.prototype.destroy = function(request, conditions, callback){
  this.conditions = conditions ? conditions : {};
  var uri = this.collectionPath() + "/" + this.id + 
            "?" + 
            Qs.stringify(this.conditions, { arrayFormat: 'brackets' });
  var root = this.root();
  var klass = this.constructor;
  http.destroy(request, uri, function(response,error){
    var object = new klass(response);
    callback(object,error);
  });
}

module.exports = Resource;

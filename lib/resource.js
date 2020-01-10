module.exports = function(api_options) {
  var extend = require("extend");
  var _ = require("underscore");
  var _s = require("underscore.string");
  var Qs = require('qs');
  var Http = require('./http').Http;
  var http = new Http(api_options);
  var Scope = require("./scope");
  var Paths = require("./paths");
  var Parse = require("./parse");
  var Resource = function(){
    this.conditions = {};
  };

  Resource.api_options = api_options;
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
    var use_api = options.use_api || api_options.default_api;
    Klass.use_api = use_api;
    Klass.api = api_options[use_api];
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
      var req_options = extend({
        uri: uri
      }, klass.api);
      http.get(request, req_options, function(response, error, api_response){
        if(error) {
          callback(response,error, api_response);
        } else {
          if(_.isArray(response)){
            var array = [];
            _.each(response, function(data){
              array.push(new klass(data));
            });
            array.pagination = response.pagination;
            callback(array,error, api_response);
          } else {
            var object = new klass(response);
            callback(object,error, api_response);
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
      var api = api_options[options.use_api || this.use_api];
      var req_options = extend({
        uri: uri
      }, api);
      http.post(request, req_options, post_data, function(data,error, api_response){
        if(error) {
          callback(null, error, api_response);
        } else {
          if(_.isArray(data)) {
            if(data.length > 0) {
              var arr = [];
              _.each(data, function(data){
                var object = new klass(data);
                arr.push(object);
              });
              arr.pagination = data.pagination;
              callback(arr, error, api_response);
            } else {
              callback(data, error, api_response);
            }
          } else {
            var object = new klass(data);
            callback(object,error, api_response);
          }
        }
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
      var klass = options.klass || this.constructor;
      var api = api_options[options.use_api || klass.use_api];
      var req_options = extend({
        uri: uri
      }, api);
      http.get(request, req_options, function(data, error, api_response){
        if(error) {
          callback(null, error, api_response);
        } else {
          if(_.isArray(data)) {
            if(data.length > 0) {
              var arr = [];
              _.each(data, function(data){
                var object = new klass(data);
                arr.push(object);
              });
              arr.pagination = data.pagination;
              callback(arr, error, api_response);
            } else {
              callback(data, error, api_response);
            }
          } else {
            var object = new klass(data);
            callback(object,error, api_response);
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
      var api = api_options[options.use_api || klass.use_api];
      var req_options = extend({
        uri: uri
      }, api);
      http.post(request, req_options, post_data, function(response,error, api_response){
        var object = new klass(response);
        callback(object,error, api_response);
      });
    }
  };

  Resource.customMemberPut = function(options){
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
      var api = api_options[options.use_api || klass.use_api];
      var req_options = extend({
        uri: uri
      }, api);
      http.put(request, req_options, post_data, function(response,error, api_response){
        var object = new klass(response);
        callback(object,error, api_response);
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
      var api = api_options[options.use_api || this.use_api];
      var req_options = extend({
        uri: uri
      }, api);
      http.put(request, req_options, post_data, function(response,error, api_response){
        var object = new klass(response);
        callback(object,error, api_response);
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
      var api = api_options[options.use_api || this.use_api];
      var req_options = extend({
        uri: uri
      }, api);
      http.get(request, req_options, function(data, error, api_response){
        if(error) {
          callback(null, error, api_response);
        } else {
          if(_.isArray(data)) {
            if(data.length > 0) {
              var arr = [];
              _.each(data, function(data){
                var object = new klass(data);
                arr.push(object);
              });
              arr.pagination = data.pagination;
              callback(arr, error, api_response);
            } else {
              callback(data, error, api_response);
            }
          } else {
            var object = new klass(data);
            callback(object,error, api_response);
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
    var req_options = extend({
      uri: uri
    }, klass.api);
    http.post(request, req_options, post_data, function(response,error, api_response){
      var object = new klass(response);
      callback(object,error, api_response);
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

  Resource.prototype.getId = function() {
    return this[this.constructor.idAttribute];
  }

  Resource.prototype.save = function(request, conditions, attributes, callback){
    this.conditions = conditions ? conditions : {};
    var uri = this.collectionPath() + "/" + this.getId() + 
              "?" + 
              Qs.stringify(this.conditions, { arrayFormat: 'brackets' });
    var root = this.root();
    var object = {};
    object[root] = attributes;
    var post_data = Qs.stringify(object, { arrayFormat: 'brackets' });
    var klass = this.constructor;
    var req_options = extend({
      uri: uri
    }, klass.api);
    http.put(request, req_options, post_data, function(response,error, api_response){
      var object = new klass(response);
      callback(object,error, api_response);
    });
  }

  Resource.prototype.destroy = function(request, conditions, callback){
    this.conditions = conditions ? conditions : {};
    var uri = this.collectionPath() + "/" + this.getId() + 
              "?" + 
              Qs.stringify(this.conditions, { arrayFormat: 'brackets' });
    var root = this.root();
    var klass = this.constructor;
    var req_options = extend({
      uri: uri
    }, klass.api);
    http.destroy(request, req_options, function(response,error, api_response){
      var object = new klass(response);
      callback(object,error, api_response);
    });
  }

  return Resource;
}

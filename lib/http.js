var http = require("http");
var _ = require('underscore')
var qs = require('qs');
var url = require('url');
var errors = require('./errors');
http.globalAgent.maxSockets = 100;

module.exports.Http = function(){
  function _Class(options){
  
    this.options = options;
    
    this._request = function(req_options, post_data, callback){
      var req = http.request(req_options, function(api_res) {
        if (api_res.statusCode <= 210 || api_res.statusCode == 422) {  
          api_res.setEncoding('utf8');
          var data = "";
          api_res.on('data', function (chunk) {
            data += chunk;
          });
          api_res.on('error', function (err) {
            callback(null,err);
          });
          api_res.on('end', function (chunk) {
            var object = null;
            var err = null;
            try{
              var arr = JSON.parse(data);
              if(_.isArray(arr)){
                object = _.map(arr,function(obj){
                  return obj[Object.keys(obj)[0]];
                });
              }else{
                object = arr[Object.keys(arr)[0]];
              }
            } catch(e) {
              err = new Error(e.message);
              err.body = data;
            }
            callback(object,err);
          });
        } else if (api_res.statusCode == 404) {
          callback(null, new errors.RecordNotFound("Api responded with "+ api_res.statusCode));
        } else if (api_res.statusCode == 401) {
          callback(null, new errors.Unauthorized("Api responded with "+ api_res.statusCode));
        } else if (api_res.statusCode == 502) {
          callback(null, new errors.BadGatewayError("Api responded with "+ api_res.statusCode));
        }  
      });
      req.callback = callback;
      req.middlewares = _.clone(options.middlewares).reverse();
      req.next = this.next;
      req.run_request = this.run_request;
      req.post_data = post_data;
      req.req_options = req_options;
      this.next(req);
    };
    
    this.next = function(req){
      if(req.middlewares.length > 0) {
        req.middlewares.pop()(req,req.next);
      } else {
        req.run_request(req);
      }
    };
    
    this.run_request = function(req){
      if(req.req_options['method'] === 'PUT' || req.req_options['method'] === 'PATCH' || req.req_options['method'] === 'POST') {
        req.write(req.post_data);
      }
      req.on("response", function(response){
        //console.log(response.body);
      }).on("error", function(err){
        req.callback(null, new Error("Api responded with "+ err.message));
      });
      req.end();
    };
    
    this.get = function(uri,callback){ 
      var req_options = _.extend({},options.api,{
        path: uri,
        method: 'GET',
        headers: {
          accept: 'json'
        }   
      });
      this._request(req_options,null,callback)
    };  
    
    this.put = function(uri,post_data,callback){
      var req_options = _.extend({},options.api,{  
        path: uri,
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
        }
      });
      this._request(req_options, post_data, callback);
    };

    this.post = function(uri,post_data,callback){
      var req_options = _.extend({},options.api,{  
        path: uri,
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
        }
      });
      this._request(req_options, post_data, callback);
    };
  }
  return _Class;
}();

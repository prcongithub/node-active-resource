var https = require("https");
var _ = require('underscore')
var qs = require('qs');
var url = require('url');
var errors = require('./errors');
https.globalAgent.maxSockets = 100;
var http = require("http");

module.exports.Http = function(){
  function _Class(api_options){
    api_options.retry_for_statuses = api_options.retry_for_statuses || [501,502,503,504];
    this.api_options = api_options;
    
    this._request = function(orig_request, req_options, post_data, callback){
      var request = {};
      request.callback = callback;
      request.middlewares = _.clone(api_options.middlewares).reverse();
      request.next = this.next;
      request.run_request = this.run_request;
      request.post_data = post_data;
      request.req_options = req_options;
      request.retry_attempt = 0;
      request.sleep = this.sleep;
      request.retry = this.retry;
      this.next(orig_request, request);
    };
    
    this.next = function(orig_request, request){
      if(request.middlewares.length > 0) {
        request.middlewares.pop()(orig_request, request, request.next);
      } else {
        request.run_request();
      }
    };
    
    this.sleep = function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    this.retry = async function() {
      var request = this;
      if(request.retry_attempt < 5) {
        request.retry_attempt++;
        var waiting_time = 2**request.retry_attempt*1000;
        console.log("Retry attempt: "+request.retry_attempt+ " for "+request.req_options.host+""+request.req_options.path);
        await request.sleep(waiting_time);
        request.run_request();
      } else {
        request.callback(null, new Error("Api responded with "+ request.api_response.statusCode), null);
      }
    }
    
    this.run_request = function(options){
      var request = this;
      if(request.auth_error) {
        request.callback(null, new Error(request.auth_error.error), null);
        return;
      }
      var httpType = this.req_options.protocol == 'https:' ? https : http;
      var api_request = httpType.request(request.req_options, function(api_res) {
        var headers = api_res.headers;
        if (api_res.statusCode <= 210 || api_res.statusCode == 422) {  
          api_res.setEncoding('utf8');
          var data = "";
          api_res.on('data', function (chunk) {
            data += chunk;
          });
          api_res.on('error', function (err) {
            request.callback(null,err,api_res);
          });
          api_res.on('end', function (chunk) {
            var object = null;
            var err = null;
            try{
              var arr = JSON.parse(data);
              if(_.isArray(arr)){
                object = _.map(arr,function(obj){
                  return obj;
                });
                if(headers['x-pagination']) {
                  object.pagination = JSON.parse(headers['x-pagination']);
                }
              }else{
                object = arr;
              }
            } catch(e) {
              err = new Error(e.message);
              err.body = data;
            }
            request.callback(object,err,api_res);
          });
        } else {
          if(api_options.retry_for_statuses.includes(api_res.statusCode)) {
            request.api_response = api_res;
            request.retry()
          } else {
            var data = "";
            api_res.on("data",function(chunk) {
              data += chunk;
            });
            api_res.on("end",function(chunk) {
              try{
                //console.log(data);
                var errorBody = JSON.parse(data);
                request.callback(null, new errors.ClientError(errorBody.error,api_res.statusCode,errorBody),api_res);
              } catch(e){
                err = new Error("ParseError "+e.message);
                err.body = data;
                request.callback(null,err,api_res);
              }
            });
          }
        }
      });
      if(['PUT','PATCH','POST'].includes(request.req_options.method)) {
        api_request.write(request.post_data);
      }
      api_request.on("response", function(response){
        //console.log(response.body);
      }).on("error", function(err){
        request.api_response = {};
        request.retry();
        //console.log(err);
        //request.callback(null, new Error("Api responded with "+ err.message), null);
      });
      api_request.end();
    };
    
    this.get = function(orig_request, request_options,callback){ 
      var req_options = _.extend({}, api_options.api, {
        path: request_options.uri,
        host: request_options.host,
        port: request_options.port,
        protocol: request_options.protocol,
        method: 'GET',
        headers: {
          accept: 'application/json'
        }   
      });
      this._request(orig_request, req_options,null,callback)
    };  
    
    this.destroy = function(orig_request, request_options, callback){ 
      var req_options = _.extend({}, api_options.api, {
        path: request_options.uri,
        host: request_options.host,
        port: request_options.port,
        protocol: request_options.protocol,
        method: 'DELETE',
        headers: {
          accept: 'application/json'
        }   
      });
      this._request(orig_request, req_options,null,callback)
    };  
    
    this.put = function(orig_request, request_options, post_data, callback){
      var req_options = _.extend({}, api_options.api, {  
        path: request_options.uri,
        host: request_options.host,
        port: request_options.port,
        protocol: request_options.protocol,
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
        }
      });
      this._request(orig_request, req_options, post_data, callback);
    };

    this.post = function(orig_request, request_options, post_data, callback){
      var req_options = _.extend({}, api_options.api, {  
        path: request_options.uri,
        host: request_options.host,
        port: request_options.port,
        protocol: request_options.protocol,
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
        }
      });
      //console.log(req_options);
      this._request(orig_request, req_options, post_data, callback);
    };
  }
  return _Class;
}();

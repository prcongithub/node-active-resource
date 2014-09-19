Node-Vger
=========

-----
Node-Vger is an ORM (Object Relational Mapper) that maps RESTful Resources to Javascript Objects in NodeJS.

  - Inspired by [HER]
  - Access API resources without having to make HTTP requests on your own.

Node-Vger allows you to define API resources on your front-end application and access them using ORM like features.

Setup
----
```
# vger.js
var options = {
  host: "api.jombaylocal.com",
  port: 80
};

var nodeVger = require('node-vger')(options);

var resources = require("./resources")

# app.js
var vger = require('vger');

```
Simple isn't it.
--

Lets see how define a Resource now
----

Sample Resource:

```
  var Resource = require('node-vger').Resource;
  var User = Resource.define_resource({
    collectionPath: "/users"
  })
```


Tech
-----------

Node-Vger uses a number of open source projects to work properly:

* [HTTP] - HTTP in NodeJS
* [Node-Extend] - node-extend is a port of the classic extend() method from jQuery.
* [QS] - A querystring parser that supports nesting and arrays, with a depth limit

Installation
--------------

```sh
# package.json
dependencies: {
  "node-vger": "git://github.com/prcongithub/node-vger.git"
}

# terminal
# cd to your app
npm install
```


License
----

MIT


**Free Software, Hell Yeah!**

[HTTP]:http://twitter.github.com/bootstrap/
[qs]:https://www.npmjs.org/package/qs
[Node-Extend]:https://github.com/justmoon/node-extend
[HER]:http://github.com/remiprev/her

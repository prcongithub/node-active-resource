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
  host: "api.yourdomain.com",
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

**Well this module is in a very primitive stage and open for contributions**

  - Fork git@github.com:prcongithub/node-vger.git
  - Create a feature branch
  - Send a Pull Request

  
Test App
------------------------


```
    # Assuming you have cloned node-vger already
    cd /path/to/node-vger/
    sudo npm link
    
    git clone git@github.com:prcongithub/node-vger-test-app.git
    npm link node-vger
    nodemon app.js
```


License
----

MIT


**Free Software, Hell Yeah!**

[HTTP]:http://twitter.github.com/bootstrap/
[qs]:https://www.npmjs.org/package/qs
[Node-Extend]:https://github.com/justmoon/node-extend
[HER]:http://github.com/remiprev/her

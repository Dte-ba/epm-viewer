var epm = require('epm');
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var path = require("path");
    
process.env.APPLICATION_PATH = path.resolve('./');
var repos = module.exports = configure(process.env.APPLICATION_PATH);

// INIT
repos.init = function(status, progress, cb){

  var status = status || (function(){ })
  var progress = progress || (function(){ })

  var st = status();

  var has = repos.isDefined();

  var msg = has ? "Chequeando directorios" : "Creando directorios";
  status(msg);

  var mainpath = path.join(repos.localpath, "main");

  mkdirp(mainpath, function(err){

    if (err) return def.reject(err);

    progress(30);

    status("Inicializando el repositorio");

    var repo = new epm.EpmRepo(mainpath);

    repos.local.main.init(function(err){

      if (err) return cb(null);

      progress(100);
      status(st);
      
      return cb && cb(null);
    })

  })

};

repos.initServer = function(cb){
  var server = process.env.EPM_SERVER;

  if (server !== undefined) {
    return cb && cb(null, server);
  }

  var serv = epm.server;

  var se = process.env.EPM_SERVER = serv.createServer({path: repos.localpath});

  se
  .listen(3225, function(err) {
    if (err) return cb && cb(err);

    console.log("serving repos at http://127.0.0.1:3225");
    return cb && cb(null, se);
  });

  se.on('close', function(){
    console.log("serve", "close");
  });

  se.on('error', function(err){
    console.log('serve', err);
  });

};

// EXISTS
repos.isDefined = function(){
  return fs.existsSync(repos.localpath) && fs.existsSync(path.join(repos.localpath, "main"));
};

function configure(dir){
  var res = {};

  res.localpath = path.join(dir, "local");

  var m = new epm.EpmRepo(path.join(res.localpath, "main"));
  m.file.saveOnSet = true

  m.log.on("log", function(data){
    console.log("log: " + data.message );
  });

  m.log.on("info", function(data){
    console.log("info: " + data.message );
  });

  m.log.on("verbose", function(data){
    console.log("verbose: " + data.message );
  });

  m.log.on("error", function(data){
    console.error("error: " + data.message );
  });  
  
  res.local = {
    main: m
  };

  res.remotes = {};

  return res;
}
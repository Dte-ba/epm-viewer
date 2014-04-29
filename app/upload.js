;(function($, ko, window, require, undefined){

  var repos = require('./app/datacontext.js');
  var main = repos.local.main;

  var async = require('async');
  var fs = require('fs');

  var _files = ko.observableArray([])
    , processing = ko.observable(false)
    , progress = ko.observable(0)
    , status = ko.observable('Iniciando ...');
  
  var refresh = function(){

  };

  var processFiles = function(files){

    processing(true);
    status('Precesando archivos');
    progress(0);

    var cuote = Math.floor(100 / files.length);
    
    _files.removeAll();

    async.eachSeries(files, function(f, callback) {

      main.engine.readMetadata(f.path, function(err, meta){
        if (err || meta === undefined){
          console.error(err);

          _files.push({
            filename: f.name,
            path: f.path,
            build: 0,
            hasError: true,
            title: "Error",
            up: ko.observable(false)}
          );

          progress(progress() + cuote);
          callback();
          return;  
        }

        _files.push({
          filename: f.name,
          path: f.path,
          hasError: false,
          build: meta.build || 1,
          meta: meta,
          title: meta.content.title,
          up: ko.observable(false)}
        );

        progress(progress() + cuote);
        callback();
      });

    }, function(err){
        if (err){
          console.log(err);
        }
        processing(false);
        
    });
  };

  var uploadHandler = function(){
    processing(true);
    status('Subiendo Archivos');
    progress(0);
    
    // force update?
    processing.valueHasMutated();
    status.valueHasMutated();
    progress.valueHasMutated();

    var cuote = Math.floor(100 / _files().length);

    async.eachSeries(_files(), function(f, callback) {
      
      var cbCalled = false;  
      console.log(f);

      var rd = fs.createReadStream(f.path);
      var rw = fs.createWriteStream(main.resolve(f.filename));

      rd.on("error", function(err) {
        console.error("Error reading " + f.path);
        console.error(err);
        fs.unlinkSync(main.resolve(f.filename));
        done(err);
      });

      rw.on("error", function(err) {
        console.error("Error writing " + f.filename);
        console.error(err);
        fs.unlinkSync(main.resolve(f.filename));
        done(err);
      });

      rw.on("close", function(ex) {
        progress(progress() + cuote);
        done();
      });

      rd.pipe(rw);

      function done(err) {
        if (!cbCalled) {
          cbCalled = true;
          callback(err);
        }
      }

    }, function(err){
        processing(false);
        
        _files.removeAll();

        if ($("#file-main").clear !== undefined){
          $("#file-main").clear();  
        }

        window.location = "index.html";

    });

  };

  var vm = { 
    progress: progress,
    status: status,
    processing: processing,
    files: _files,
    uploadHandler: uploadHandler
  };

  //
  // apply ko
  $(function(){

    ko.applyBindings(vm);

    refresh();
  });


  $(document).ready(function(){
    $('input[type=file]').bootstrapFileInput();
      $( "#file-main" ).change(function(evt) {
          var files = evt.target.files; // FileList object
          var res = [];

          for (var i = 0, f; f = files[i]; i++) {
            res.push({ name: f.name, path: f.path, type: f.type, size: f.size });
          }

          processFiles(files);

      });
  })

})(jQuery, ko, window, require)
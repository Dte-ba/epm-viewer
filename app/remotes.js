;(function($, ko, window, require, undefined){

  var repos = require('./app/datacontext.js');
  
  var async = require('async');
  var request = require('request');

  var main = repos.local.main;

  var async = require('async');
  var fs = require('fs');

  var processing = ko.observable(true)
    , progress = ko.observable(0)
    , status = ko.observable('Iniciando ...')
    , remotes = ko.observableArray([])
    , remoteName = ko.observable('')
    , remoteUrl = ko.observable('');
  
  var refresh = function(){
    processing(true);

    main.remote.list({}, function(err, data){

      if (err) {
        showMessage('danger', err.toString());
        return;
      }

      var rs = Object.keys(data).map(function(key){
        console.log(data);
        return {
          name: key,
          url: data[key].url,
          version: ko.observable(''),
          status: ko.observable('down'),
          type: ko.observable('none'),
        };
      });

      var tasks = rs.map(function(r){
        return function(cb){
          var surl = r.url.substring(0, r.url.lastIndexOf('/'));
          request(surl, function (err, res, body){
            r.version('none');
            r.status('down');
            r.type('none');
            
            if (err) { return cb & cb(null); }

            try{
              var info = JSON.parse(body);
              console.log(info);
              r.version(info.version);
              r.status('up');
              r.type(info.type);
            } catch(er){}

            cb & cb(null);
          });
        };
      });

      async.parallel(tasks, function(){
        processing(false);
        remotes(rs);
      });

    });

  };

  var addHandler = function(){
    remoteName('');
    remoteUrl('');
  };

  var saveRemoteHandler = function(){
    main.remote.add({ name: remoteName(), url: remoteUrl() }, function(err, data){
      if (err) {
        showMessage('danger', err.toString());
        return;
      }

      $('#modalRemote').modal('hide');
      showMessage('success', '<strong>' + remoteName() + '</strong> agregado correctamente');
      refresh();
    });
  };

  var showMessage = function(type, msg){
    var html;

    html  = '<div class="alert alert-' + type + ' alert-dismissable">'
    html += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
    html += msg
    html += '</div>'

    $('#messageHost').html(html);
  };

  var vm = { 
    progress: progress,
    status: status,
    processing: processing,
    remotes: remotes,
    remoteName: remoteName,
    remoteUrl: remoteUrl,
    addHandler: addHandler,
    saveRemoteHandler: saveRemoteHandler
  };

  //
  // apply ko
  $(function(){

    ko.applyBindings(vm);

    refresh();
  });


})(jQuery, ko, window, require)
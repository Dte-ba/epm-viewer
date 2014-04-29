;(function($, ko, window, require, undefined){

  var epm = require('epm');

  var repos = require('./app/datacontext.js');
  var main = repos.local.main;

  var srvUrl = 'http://localhost:3225/main.epm';

  var url = require('url');
  var querystring = require("querystring")

  var hasRepos = ko.observable(false);
  var processing = ko.observable(true);
  var progress = ko.observable(0);
  var status = ko.observable('Iniciando ...');
  var packages = ko.observableArray([]);
  var remoteName = ko.observable('None');

  var refresh = function(){
    var current = url.parse(window.location.href);
    var query = querystring.parse(current.query)
    
    remoteName(query.name)
    refreshPackages();
  };

  var refreshPackages = function(){

    processing(true);
    
    main.remote.list({}, function(err, data){

      var r = data[remoteName()];

      if (r === undefined){
        showMessage('danger', 'No se ha podido obtener la información');
        processing(false);
        return;
      }

      status('Obteniendo información de paquetes ...');
      $.ajax({
        type: 'GET',
        url: srvUrl
      }).done(function(local){

        $.ajax({
          type: 'GET',
          url: r.url
        }).done(function(data){

          packages(transform(local, data, r.url));
          processing(false);

        })
        .fail(function(err){
          showMessage('danger', 'No se ha podido obtener la información');
          processing(false);
        });

      })
      .fail(function(err){
        showMessage('danger', 'No se ha podido obtener la información LOCAL');
        processing(false);
      });

    });

  };

  var transform = function(local, data, srvUrl){
    return data.map(function(d){
      
      var info = {  
        shortuid: epm.engine.cutUid(d.uid),
        front: srvUrl + '?uid=' + d.uid + '&asset=front',
        class: 'no-local'
      };

      var p = local.filter(function(l){
        return d.uid.toLowerCase() === l.uid.toLowerCase();
      });

      if (p.length > 0){
        if (parseInt(d.build) < parseInt(p[0].build)){
          info.class = 'update-local';
        } else {
          info.class = 'has-local';
        }
      }

      return info;
    });
  };

  var pullHandler = function() {

    processing(true);
    progress(0);

    var ops = {
      remote: remoteName(),
      progress: progress,
      status: status,
      fromWeb: true
    };

    main.pull(ops, function(err, data){
      if (err) {
        showMessage('danger', err.toString());
      }

      processing(false);
      refreshPackages();
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

  function init() {


    setInterval(function(){

      main.remote.list({}, function(err, data){
        var r = data[remoteName()];
        if (r !== undefined){
          $.ajax({
            type: 'GET',
            url: r.url
          }).done(function(data){
            if (data.length !== packages().length){
              refreshPackages();
            }
          }); 
        }
      });
      
    }, 1000*10);
  };

  init();

  var vm = { 
    processing: processing,
    progress: progress,
    status: status,
    packages: packages,
    remoteName: remoteName,
    pullHandler: pullHandler
  };

  //
  // apply ko
  $(function(){

    ko.applyBindings(vm);

    refresh();
  })

})(jQuery, ko, window, require)
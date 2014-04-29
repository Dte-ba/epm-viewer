;(function($, ko, window, require, undefined){

  var repos = require('./app/datacontext.js');
  var epm = require('epm');
  var server;
  var srvUrl = 'http://localhost:3220/main.epm';

  var hasRepos = ko.observable(false);
  var processing = ko.observable(true);
  var progress = ko.observable(0);
  var status = ko.observable('Iniciando ...');
  var packages = ko.observableArray([]);

  var refresh = function(){

    hasRepos(repos.isDefined());

    if (hasRepos()) {

      processing(true);
      progress(0);

      repos.initServer(function(err, serv){
        server = serv;

        processing(false);
        refreshPackages();
      });
    }
  };

  var refreshPackages = function(){

    processing(true);
    progress(100);

    status('Obteniendo información de paquetes ...')
    $.ajax({
      type: 'GET',
      url: srvUrl
    }).done(function(data){
      console.log(transform(data));
      packages(transform(data));

      processing(false);
    });

  };

  var transform = function(data){
    return data.map(function(d){
      return {  
        shortuid: epm.engine.cutUid(d.uid),
        front: srvUrl + '?uid=' + d.uid + '&asset=front'
      };
    });
  };

  var createRepoHandler = function(){
    
    processing(true);
    repos.init(status, progress, function(err){
      
      hasRepos(true);
      processing(false);

    });

  };

  var vm = { 
    hasRepos: hasRepos,
    processing: processing,
    progress: progress,
    status: status,
    createRepoHandler: createRepoHandler,
    packages: packages
  };

  //
  // apply ko
  $(function(){

    ko.applyBindings(vm);

    refresh();
  })

})(jQuery, ko, window, require)
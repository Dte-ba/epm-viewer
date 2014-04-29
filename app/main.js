;(function($, ko, window, require, undefined){

  var repos = require('./app/datacontext.js');
  var epm = require('epm');
  var server;
  var srvUrl = 'http://localhost:3225/main.epm';

  var hasRepos = ko.observable(false);
  var processing = ko.observable(true);
  var progress = ko.observable(0);
  var status = ko.observable('Iniciando ...');
  var packages = ko.observableArray([]);
  var filterText = ko.observable('');

  var refresh = function(){

    hasRepos(repos.isDefined());

    if (hasRepos()) {

      processing(true);
      progress(0);

      repos.initServer(function(err, serv){
        server = serv;

        if (err) {
          showMessage('danger', err.toString());
          processing(false);
          return;
        }

        processing(false);
        refreshPackages();
      });
    } else {
      processing(false);
    }
  };

  var refreshPackages = function(){

    processing(true);
    progress(100);

    status('Obteniendo información de paquetes ...')
    var furl = srvUrl;

    if (filterText() !== ''){
      furl = furl + '?filter=' + filterText()
    }
    
    $.ajax({
      type: 'GET',
      url: furl
    }).done(function(data){
      console.log(transform(data));
      packages(transform(data));

      processing(false);
    })
    .fail(function(err){
      showMessage('danger', JSON.stringify(err));
      processing(false);
    });;

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
      refresh();

    });

  };

  var filterHanlder = function(){
    refreshPackages();
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
    hasRepos: hasRepos,
    processing: processing,
    progress: progress,
    status: status,
    createRepoHandler: createRepoHandler,
    packages: packages,
    filterHanlder: filterHanlder,
    filterText: filterText
  };

  //
  // apply ko
  $(function(){

    ko.applyBindings(vm);

    refresh();
  })

})(jQuery, ko, window, require)
;(function($, ko, window, require, undefined){

  var currentIP = ko.observable('127.0.0.1');

  var epmLink = ko.computed(function(){
    return 'http://' + currentIP() + ':3225/main.epm';
  });

  var getNetworkIP = (function () {
    var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;
    var acceptRE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i;

    var commonRE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i;

    var exec = require('child_process').exec;
    var cached;    
    var command;
    var filterRE;

    switch (process.platform) {
      case 'win32':
      //case 'win64': // TODO: test
        command = 'ipconfig';
        filterRE = /\bIPv[46][^:\r\n]+:\s*([^\s]+)/g;
        break;
      case 'darwin':
        command = 'ifconfig';
        filterRE = /\binet\s+([^\s]+)/g;
        // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
        break;
      default:
        command = 'ifconfig';
        filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
        // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
        break;
    }

    return function (callback, bypassCache) {
       // get cached value
      if (cached && !bypassCache) {
        callback(null, cached);
        return;
      }
      // system call
      exec(command, function (error, stdout, sterr) {
        var ips = [];
        // extract IPs
        var matches = stdout.match(filterRE);
        // JS has no lookbehind REs, so we need a trick
        for (var i = 0; i < matches.length; i++) {
          ips.push(matches[i].replace(filterRE, '$1'));
        }

        // filter BS
        for (var i = 0, l = ips.length; i < l; i++) {
          if (!ignoreRE.test(ips[i]) && acceptRE.test(ips[i])) {
            //if (!error) {
              cached = ips[i];
            //}
            callback(error, ips[i]);
            return;
          }
        }
        // nothing found
        callback(error, null);
      });
    };
  })();

  getNetworkIP(function (error, ip) {
    
    if (!error) {
      currentIP(ip);
    } else {
      console.log('error:', error);
    }

  }, false);


  var vm = {
    epmLink: epmLink
  };

  //
  // apply ko
  $(function(){

    ko.applyBindings(vm);

  });

})(jQuery, ko, window, require);
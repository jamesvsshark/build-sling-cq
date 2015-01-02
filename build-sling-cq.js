'use strict';
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var util = require('util');
var net = require('net');

var srcLocations = [],
  pkgNames = [],
  i, command, d, mvnRun, cqSling,
  readSettings, s, p, mvnJars;

// optionally read settings.json to get file paths, etc set to false to set inline
readSettings = true;

if (readSettings && fs.existsSync('settings.json')) {
  var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
  srcLocations = settings.srcLocations;
  pkgNames = settings.pkgNames;
  mvnJars = settings.mvnJars;
  for (var i = 0; i<srcLocations.length; i++) {
    console.log("srcLocation: " + srcLocations[i] + " | pkgName: " + pkgNames[i]);
  }  
} else if (!readSettings) {
 //only set these if you didn't configure settings.json
  srcLocations[0] = './uhc_member/aarpmedicareplans';
  //... srcLocations[6] = './uhc_framework/ui';
  pkgNames[0] = 'uhc-member-aarpmedicareplans';
  //... pkgNames[6] = 'framework-ui';
  mvnJars = 'yourArbitraryFolderForMvnToCopyJarsTo'
}


if (!fs.existsSync(mvnJars)) util.debug('no mvnJars');
//see if publisher is running -- todo put ports/hosts etc in settings
util.debug('about to connect to publisher');
var client = net.connect({port: 4503},
 function () {      
  console.log('client connected');
  client.end();
});
util.debug('about to connect to author');
var client = net.connect({port: 4502},
 function () {      
  console.log('client connected');
  client.end();
});


//
var SlingPkg = function (location, pkgName) {
    this.location = location,
    this.mvnCommand = "mvn -f " + this.location + " clean install";
    this.srcLocation = this.location + "/target";
    this.pkgName = pkgName;

    this.readDir = function (sling) {
      var targetLocation = location + '/target';
      fs.readdir(targetLocation, function (err, list) {
        if (err) {
          throw err;
        }
        for (var l in list) {
          console.log('listl: ' + list[l]);
          if (list[l].indexOf('.zip') !== -1) {
            util.debug('found ZIP: ' + list[l]);
            sling(list[l]);
          } else if (list[l].indexOf('.jar') !== -1) {
            util.debug('found JAR: ' + list[l]);
            fs.createReadStream(targetLocation + '/' + list[l]).pipe(fs.createWriteStream(mvnJars + list[l]));

          }
        }        
      });
    };

    this.mvnExec = function (read, sling) {
      util.debug('mvnCommand: ' + this.mvnCommand);
      exec(this.mvnCommand, {maxBuffer: 1024 * 500000}, function (error, stdout, stderr) {
        if (error !== null) {
          util.debug('exec error: ' + error);
        } else {
          read(sling);
          util.debug('Response: ' + stdout);
        };
      });
    }

    this.slingPkgToCQ = function (pkgFile) {

      var slingCmd = "curl -u admin:admin -F file=@"+location + "/target/" + pkgFile;
      slingCmd += " -F name="+pkgName+" -F force=true -F install=true";
      slingCmd += " http://localhost:4503/crx/packmgr/service.jsp";

      util.debug('slingCmd: ' + slingCmd);
      exec(slingCmd, {maxBuffer: 1024 * 500000}, function (error, stdout, stderr) {
        if (error !== null) {
          util.debug('exec error: ' + error);
        } else {
          util.debug('Response: ' + stdout);
        };
      });
    };
  };

var buildSlingCQ = function () {
  for (i = 0; i < srcLocations.length; i++) {
    var slingPkg = new SlingPkg(srcLocations[i], pkgNames[i]);
    var runExec = slingPkg.mvnExec(slingPkg.readDir, slingPkg.slingPkgToCQ);
       util.debug('started mvnExec ' + i);
  }
}();


//build-sling-cq.js

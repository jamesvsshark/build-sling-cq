'use strict';
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var util = require('util');

//folder to copy jars to
var cqinstallfolder = '/c/cq-build-jars'; // who puts spaces in folder names -- rename after reboot /publish/crx-quickstart/install/'

//svn src folders for maven

var srcLocations = [],
  pkgNames = [],
  i, command, d, mvnRun, cqSling;

srcLocations[0] = './uhc_member/aarpmedicareplans';
srcLocations[1] = './uhc_member/uhcmedicaresolutions';
srcLocations[2] = './uhc_member/ui';
srcLocations[3] = './uhc_acquisition/aarpmedicareplans'; //uhc-acquisition-aarpmedicareplans
srcLocations[4] = './uhc_acquisition/ui'; //uhc-acquisition-ui
srcLocations[5] = './uhc_acquisition/uhcmedicaresolutions'; //uhc-acquisition-uhcmedicaresolutions
srcLocations[6] = './uhc_framework/ui'; //framework-ui

//package names for curl install
pkgNames[0] = 'uhc-member-aarpmedicareplans';
pkgNames[1] = 'uhc-member-uhcmedicaresolutions';
pkgNames[2] = 'uhc-member-ui';
pkgNames[3] = 'uhc-acquisition-aarpmedicareplans';
pkgNames[4] = 'uhc-acquisition-ui';
pkgNames[5] = 'uhc-acquisition-uhcmedicaresolutions';
pkgNames[6] = 'framework-ui';


var getTargetZip = function (i) {
  var p = srcLocations[i] + '/target';
  fs.readdir(p, function (err, list) {
      if (err) {
          throw err;
      }
      for (var l in list) {
        console.log (list[l]);
      }
  });
};


var SlingPkg = function (location, pkgName) {
    this.location = location,
    this.mvnCommand = "mvn -f " + this.location + " clean install";
    this.srcLocation = this.location + "/target";
    this.pkgName = pkgName;

    this.readDir = function (callback) {
      var targetLocation = location + '/target';
      fs.readdir(targetLocation, function (err, list) {
        if (err) {
          throw err;
        }
        for (var l in list) {
          //console.log('listl: ' + list[l]);
          if (list[l].indexOf('.zip') !== -1) {
            console.log('found ZIP: ' + list[l]);
            callback(list[l]);
          } else if (list[l].indexOf('.jar') !== -1) {
            console.log('found JAR: ' + list[l]);

          }
      //destPath = destPath.substring(path.dirname(destPath).indexOf('jcr_root/') + 9);
        }
        //  console.log ('THIS IS THE LIST! ' + list[l]);
        
      });
    };

    this.mvnExec = function (callback1, callback2) {
      console.log('mvnCommand: ' + this.mvnCommand);
      exec(this.mvnCommand, function (error, stdout, stderr) {
        if (error !== null) {
          util.debug('exec error: ' + error);
        } else {
          callback1(callback2);
          console.log('Response: ' + stdout);
        };
      });
    }

    this.slingPkgToCQ = function (pkgFile) {

      var slingCmd = "curl -u admin:admin -F file=@"+location + "/target/" + pkgFile;
      slingCmd += " -F name="+pkgName+" -F force=true -F install=true";
      slingCmd += " http://localhost:4503/crx/packmgr/service.jsp";

      console.log('slingCmd: ' + slingCmd);
      exec(slingCmd, function (error, stdout, stderr) {
        if (error !== null) {
          util.debug('exec error: ' + error);
        } else {
          console.log('Response: ' + stdout);
        };
      });
    };
  };

var runAndGet = function () {
  for (i = 0; i < srcLocations.length; i++) {
    var slingPkg = new SlingPkg(srcLocations[i], pkgNames[i]);
    console.log('about to run mvnExec');
    var runExec = slingPkg.mvnExec(slingPkg.readDir, slingPkg.slingPkgToCQ);
       console.log('ran mvnExec ' + i);
  }
}();

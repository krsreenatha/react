'use strict';

var grunt = require('grunt');
var fs = require('fs');

module.exports = function() {
  var config = this.data;
  var done = this.async();

  var theFilesToTestScript = fs.createWriteStream(__dirname + '/../../test/the-files-to-test.generated.js');
  theFilesToTestScript.write('// Generated by ');
  theFilesToTestScript.write(JSON.stringify(__filename.split(/(?=grunt)/)[1]));
  theFilesToTestScript.write(' at ');
  theFilesToTestScript.write(JSON.stringify(new Date()));
  theFilesToTestScript.write('\n\n');

  // create the bundle we'll work with
  var args = config.args;

  // Make sure the things that need to be exposed are.
  var requires = config.requires || [];
  grunt.file.expand({
    nonull: true, // Keep IDs that don't expand to anything.
    cwd: config.rootDirectory
  }, requires).forEach(function(name) {
    name = name.replace(/\.js$/i, "");
    args.push(name);
    theFilesToTestScript.write('harness.enableTest(' + JSON.stringify(name) + ');\n');
  });

  require("populist").buildP({
    rootDirectory: config.rootDirectory,
    args: args
  }).then(function(output) {
    grunt.file.write(config.outfile, output);
    theFilesToTestScript.end();
    theFilesToTestScript.once('close', done);
  });
};

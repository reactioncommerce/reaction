exports.compileLess = function(test){
  var grunt = require('grunt'),
      fs = require('fs'),
      jsdiff = require('diff'),
      t = test,
      filename = 'select2-bootstrap.css',
      patchfile = 'test/support/less.patch',

      child = grunt.util.spawn({
        cmd: 'lessc',
        args: ['--verbose', 'lib/build.less', 'tmp/'+filename]
      }, function() {
        var readFile = function(name) { return fs.readFileSync(name, {encoding: 'utf8'}) },
            orig = readFile(filename),
            generated = readFile('tmp/'+filename),
            patch = readFile(patchfile),
            diff = jsdiff.createPatch(filename, orig, generated);

        // Save the output for future tests.
        // fs.writeFileSync(patchfile, diff);

        t.equal(patch, diff);
        t.done();
      });
};
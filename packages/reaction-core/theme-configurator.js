var fs   = Npm.require('fs');
var path = Npm.require('path');

var createLessFile = function (path, content) {
  fs.writeFileSync(path, content.join('\n'), { encoding: 'utf8' });
};

var getAsset = function (filename) {
  return ThemeData(filename);
};

var getLessContent = function (filename) {
  var content = getAsset(filename);
  return '\n\n// @import "' + filename + '"\n'
    + content.replace(/@import\s*["']([^"]+)["'];?/g, function (statement, importFile) {
    return getLessContent(path.join(path.dirname(filename), importFile));
  });
};

var handler = function (compileStep, isLiterate) {
  var jsonPath = compileStep._fullInputPath;

  // read the configuration of the project
  var userConfiguration = compileStep.read().toString('utf8');

  // if empty (and only then) write distributed configuration
  if (userConfiguration === '') {
    userConfiguration = distributedConfiguration;
    fs.writeFileSync(jsonPath, userConfiguration);
  }

  // parse configuration
  try {
    userConfiguration = JSON.parse(userConfiguration);
  } catch (e) {
    compileStep.error({
      message: e.message,
      sourcePath: compileStep.inputPath
    });
    return;
  }

  // configuration
  var moduleConfiguration = userConfiguration.modules || {};

  // these variables contain the files that need to be included
  var js = {}; // set of required js files
  var less = {}; // set of required less files

  // read module configuration to find out which js/less files are needed
  var allModulesOk = _.every(moduleConfiguration, function (enabled, module) {

    var moduleDefinition = moduleDefinitions[module];
    if (moduleDefinition == null) {
      compileStep.error({
        message: "The module '" + module + "' does not exist.",
        sourcePath: compileStep.inputPath
      });
      return false; // break
    }

    if (! enabled) {
      return true; // continue
    }

    _.each(moduleDefinition.less || [], function (file) {
      less[file] = file;
    });
    _.each(moduleDefinition.js || [], function (file) {
      js[file] = file;
    });

    return true;
  });

  if (! allModulesOk) {
    return;
  }

  // add javascripts
  for (var jsPath in js) {
    var file = getAsset(jsPath);
    compileStep.addJavaScript({
      path: jsPath,
      data: file,
      sourcePath: jsPath,
      bare: true // they are already wrapped (tiny optimisation)
    });
  }

  // filenames
  var mixinsLessFile = jsonPath.replace(/json$/i, 'mixins.import.less')
  var importLessFile = jsonPath.replace(/json$/i, 'import.less');
  var bootStrapLessFile = jsonPath.replace(/json$/i, 'bootstrap.less');
  var outputLessFile = jsonPath.replace(/json$/i, 'less');

  createLessFile(mixinsLessFile, [
    "// THIS FILE IS GENERATED, DO NOT MODIFY IT!",
    "// These are the mixins bootstrap provides",
    "// They are included here so you can use them in your less files too,",
    "// However: you should @import \"" + path.basename(importLessFile) + "\" instead of this",
    getLessContent('default/mixins.less')
  ]);

  // create the file that can be modified
  if (! fs.existsSync(importLessFile)) {
    createLessFile(importLessFile, [
      "// This File is for you to modify!",
      "// It won't be overwritten as long as it exists.",
      "// You may include this file into your less files to benefit from",
      "// mixins and variables that bootstrap provides.",
      '',
      '@import "' + path.basename(mixinsLessFile) + '";',
      getLessContent('default/variables.less')
    ]);
  }

  // create the file that finally includes bootstrap
  var bootstrapContent = [
    "// THIS FILE IS GENERATED, DO NOT MODIFY IT!",
    "// It includes the bootstrap modules configured in " + compileStep.inputPath + ".",
    "// You may need to use 'meteor add less' if the styles are not loaded.",
    '',
    "// If it throws errors your bootstrap.import.less is probably invalid.",
    "// To fix that remove that file and then recover your changes.",
    '',
    '@import "' + path.basename("custom.bootstrap.less") + '";',
    '@import "' + path.basename(importLessFile) + '";'
  ];
  _.each(less, function (lessPath) {
    bootstrapContent.push(getLessContent('' + lessPath));
  });
  createLessFile(outputLessFile, bootstrapContent);
};

Plugin.registerSourceHandler('reaction.json', {archMatching: 'web'}, handler);

var fs   = Npm.require('fs');
var path = Npm.require('path');
var _ = Npm.require('underscore');

var handler = function (compileStep) {
  var jsonPath = compileStep._fullInputPath;
  
  var analyticsConfiguration = compileStep.read().toString('utf8');
  
  if (analyticsConfiguration === '') {
    analyticsConfiguration = defaultConfiguration;
    fs.writeFileSync(jsonPath, analyticsConfiguration)
  }
  
  try {
    analyticsConfiguration = JSON.parse(analyticsConfiguration);
  } catch (e) {
    compileStep.error({
      message: e.message,
      sourcePath: compileStep.inputPath
    });
    return;
  }
  
  var analyticsLibs = [];
  
  // Read through config file to see which analytics libs are enabled
  var analyticsLibsSetup = _.every(analyticsConfiguration, function(enabled, analyticsProvider) {
    
    var filesrc = analyticsLibs[analyticsProvider];
    if (!filesrc) {
      compileStep.error({
        message: "The analytics library for " + analyticsProvider + " does not exist.",
        sourcePath: compileStep.inputPath
      });
      return false; // Throw error and exit if we can't find the file.
    }
    
    if (!enabled) {
      return true; // If analytics provider is disabled, skip it
    }
    
    analyticsLibs << fileSrc;
    
    return true;
  });
  
  if (!analyticsLibsSetup) {
    return false;
  }
  
  _.each(analyticsLibs, function(libSrc) {
    var lib = Asset.getText(libSrc);
    compileStep.addJavaScript({
      path: libSrc,
      data: lib,
      sourcePath: libSrc,
      bare: true
    });
  });
};

Plugin.registerSourceHandler('analyticsSettings.json', {archMatching: 'web'}, handler);

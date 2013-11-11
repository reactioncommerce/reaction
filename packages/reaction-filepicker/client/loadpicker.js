// *****************************************************
// Instantiates loadpicker and applies key
//
// *****************************************************

loadPicker = function (callback) {
  if (!filepicker.keyIsSet) {
    $.gritter.add({
      title: 'Filepicker.io is not configured',
      text: 'You can do that on the <a href="/filepicker-io">package dashboard</a>.'
    });
    return false;
  }
  return callback && callback();
};

var filepickerLoadCallback = function () {
  Meteor.startup(function () {
    Deps.autorun(function () {
      var keydata = ReactionConfig.findOne({userId: Meteor.userId(), name: "reaction-filepicker", "metafields.apikey": {$exists: true}});
      if (keydata && keydata.metafields && keydata.metafields.apikey) {
        filepicker.setKey(keydata.metafields.apikey);
        filepicker.keyIsSet = true;
      }
    });
  });
};

//If the script doesn't load
var filepickerErrorCallback = function (error) {
  if (typeof console != undefined) {
    console.log(error);
  }
};

//Generate a script tag
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = '//api.filepicker.io/v1/filepicker.js';
script.onload = filepickerLoadCallback;
script.onerror = filepickerErrorCallback;

//Load the script tag
var head = document.getElementsByTagName('head')[0];
head.appendChild(script);

Template["filepicker-io"].helpers({
  pickerData: function () {
    return PackageConfigs.findOne({name: "reaction-filepicker"});
  }
});

Template["filepicker-io"].events({
  'submit form': function (event) {
    event.preventDefault();
    var apikey = $(event.target).find('[name=input-apikey]').val();
    var packageConfig = PackageConfigs.findOne({name: "reaction-filepicker"});
    PackageConfigs.update({_id: packageConfig._id}, {$set: {apikey: apikey}});
    // TODO: Validate key with filepicker before adding
    // throwError("Success");
    $.pnotify({title: 'Saved "' + apikey + '"',text: 'Filepicker.io is now configured.',type: 'success'});
    Router.go('dashboard');
  },
  'click .cancel': function (event){
    history.go(-1);
    return false;
  }
});

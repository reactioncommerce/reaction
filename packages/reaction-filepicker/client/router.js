Router.map(function () {
  this.route('filepicker-io', {
    template: 'filepicker-io',
    waitOn: function () {
      return PackageConfigsHandle;
    }
  });
});

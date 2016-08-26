/**
 * uploadHandler method
 */

function uploadHandler(event, instance) {
  const files = [];

  FS.Utility.eachFile(event, (file) => {
    files.push(new FS.File(file));
  });

  if (instance.data.onUpload) {
    instance.data.onUpload(files, event);
  }

  return files;
}

Template.upload.helpers({
  uploadButtonProps() {
    const instance = Template.instance();
    return {
      className: "btn-block",
      label: instance.data.label || "Drop file to upload",
      i18nLabel: instance.data.i18nLabel || "productDetail.dropFiles",
      onClick() {
        instance.$("input[name=files]").click();
      }
    };
  }
});

Template.upload.events({
  "click #btn-upload": function () {
    return $("#files").click();
  },
  "change input[name=files]": uploadHandler,
  "dropped .js-dropzone": uploadHandler
});

Meteor.app.packages.register
  name: "reaction-filepicker"
  provides: ['fileUploader']
  label: "Filepicker.io"
  description: "<a href='http://filepicker.io' target='_blank' class='dashlink'>Filepicker.io</a> for Reaction"
  icon: "fa fa-cloud-upload"
  settingsRoute: "filepicker-io"
  hasWidget: false
  priority: "9"
  shopPermissions: [
    {
      label: "Ink Filepicker"
      permission: "dashboard/settings"
      group: "Shop Settings"
    }
  ]
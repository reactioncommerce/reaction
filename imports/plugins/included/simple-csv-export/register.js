import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Export-CSV",
  name: "reaction-simple-export-csv",
  icon: "fa fa-file-excel-o",
  autoEnable: true,
  settings: {
    enabled: true
  },
  registry: [
    // Settings panel
    {
      label: "Simple CSV Export", // this key (minus spaces) is used for translations
      provides: ["exportSettings"],
      container: "dashboard",
      template: "simpleCsvExport"
    }]
});

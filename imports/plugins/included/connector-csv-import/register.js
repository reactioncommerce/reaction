import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "CSV Import Connector",
  name: "connector-csv-import",
  icon: "fa fa-cloud-upload",
  autoEnable: true,
  settings: {},
  registry: [
    {
      label: "CSV Import Connector",
      provides: ["connectorScreen"],
      container: "dashboard",
      template: "csvImportConnectorSettings"
    }
  ]
});

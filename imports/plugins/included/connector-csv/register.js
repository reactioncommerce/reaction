import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "CSV Connector",
  name: "connector-csv",
  icon: "fa fa-exchange",
  autoEnable: true,
  settings: {},
  registry: [
    {
      label: "CSV Connector",
      provides: ["connectorsScreen"],
      container: "CSVConnector"
    }
  ]
});

Reaction.registerPackage({
  label: "AWS S3 Connector Settings",
  name: "connector-settings-aws-s3",
  icon: "fa fa-exchange",
  autoEnable: true,
  settings: {
    bucket: "",
    accessKey: "",
    secretAccessKey: ""
  },
  registry: []
});

Reaction.registerPackage({
  label: "SFTP Connector Settings",
  name: "connector-settings-sftp",
  icon: "fa fa-exchange",
  autoEnable: true,
  settings: {
    ipAddress: "",
    port: "",
    username: "",
    password: ""
  },
  registry: []
});

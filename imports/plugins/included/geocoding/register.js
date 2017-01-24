import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Geocoding",
  name: "reaction-geocode",
  icon: "fa fa-globe",
  autoEnable: true,
  settings: {
    name: "Geocoding"
  },
  registry: []
});

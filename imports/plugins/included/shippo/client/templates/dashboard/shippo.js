import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { ShippoPackageConfig } from "../../../lib/collections/schemas";


Template.shippoSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-shippo"
    });
  },
  SearchPackageConfig() {
    return ShippoPackageConfig;
  }
  // ,
  //
  //
  // checkboxAtts() {
  //   return {
  //     class: "checkbox-switch"
  //   };
  // }
});

//
// AutoForm.hooks({
//   "shippo-update-form": {
//     onSuccess() {
//       Alerts.removeSeen();
//       return Alerts.toast("Shippo settings saved.", "success", {
//         autoHide: true
//       });
//     },
//     onError(operation, error) {
//       Alerts.removeSeen();
//       return Alerts.toast(`Shippo settings update failed. ${error}`, "error");
//     }
//   }
// });

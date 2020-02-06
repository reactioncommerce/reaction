import { Template } from "meteor/templating";
import { VCoinSettingsFormContainer } from "../containers";
import "./vcoin.html";

Template.vcoinSettings.helpers({
  VcoinSettings() {
    return {
      component: VCoinSettingsFormContainer
    };
  }
});

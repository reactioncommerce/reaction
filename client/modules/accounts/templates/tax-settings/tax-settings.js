import { Accounts } from "/lib/collections";
import { Template } from "meteor/templating";


Template.taxSettingsPanel.helpers({
  account() {
    return Accounts.findOne();
  }
});

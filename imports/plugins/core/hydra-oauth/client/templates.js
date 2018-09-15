import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.hydraOauthLoginForm.helpers({
  component() {
    return { component: Components.Login };
  }
});

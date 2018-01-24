import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Reaction } from "/client/api";

Template.verifyAccount.onCreated(() => {
  const template = Template.instance();
  template.verified = ReactiveVar(false);
  const email = Reaction.Router.getQueryParam("email");
  Meteor.call("accounts/verifyAccount", email, (error, result) => {
    if (error) {
      throw new Meteor.Error("account-verification-error", error);
    }
    return template.verified.set(result);
  });
});

Template.verifyAccount.helpers({
  verificationStatus() {
    return Template.instance().verified.get();
  }
});

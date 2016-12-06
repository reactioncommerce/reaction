import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Templates } from "/lib/collections";
import { EmailTemplates } from "../../lib/collections/schemas";

/*
 * Subscribe to Templates collections
 */
Template.emailTemplatesDashboard.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Templates");
  });
});


/*
 * template emailTemplatesDashboard helpers
 */
Template.emailTemplatesDashboard.helpers({
  emailTemplate() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      return Templates.find({
        shopId: Reaction.getShopId(),
        type: "email"
      });
    }
  }
});


/*
 * template emailTemplatesDashboard events
 */
Template.emailTemplatesDashboard.events({
  "click [data-event-action=editEmailTemplate]"(event) {
    event.preventDefault();

    Reaction.showActionView({
      label: i18next.t("templates.edit"),
      data: this,
      template: "emailTemplateSettings"
    });

    // TODO: What does this do?
    Session.set("updatedMethodObj", "");
    Session.set("selectedMethodObj", this);
  }
});


/*
 * Template emailTemplatesSettings Helpers
 */
Template.emailTemplateSettings.onCreated(function () {
  this.state = new ReactiveDict();

  this.autorun(() => {
    const currentData = Template.currentData();
    const template = Templates.findOne(currentData._id);

    this.state.set("template", template);
  });
});


/*
 * Template emailTemplatesSettings Helpers
 */
Template.emailTemplateSettings.helpers({
  template() {
    return Template.instance().state.get("template");
  },

  emailTemplateSchema() {
    return EmailTemplates;
  }
});


AutoForm.hooks({
  "email-template-edit-form": {
    onSubmit: function (insertDoc) {
      this.event.preventDefault();

      const templateId = this.docId;

      Meteor.call("templates/email/update", templateId, insertDoc, (error, result) => {
        if (error) {
          Alerts.toast(i18next.t("templates.alerts.failedToUpdate", { err: error.message }), "error");
          this.done(new Error("Failed to update template: ", error));
          return false;
        }
        if (result) {
          this.done();
        }
      });
    }
  }
});


Blaze.TemplateInstance.prototype.parentTemplate = function (levels = 1) {
  let view = Blaze.currentView;
  let numLevel = levels;
  while (view) {
    if (view.name.substring(0, 9) === "Template." && !numLevel--) {
      return view.templateInstance();
    }
    view = view.parentView;
  }
};

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
    // "click [data-event-action=addShippingMethod]"(event) {
    //   event.preventDefault();
    //
    //   Reaction.showActionView({
    //     label: i18next.t("shipping.addShippingMethod"),
    //     template: "addShippingMethod"
    //   });
    // }

  "click [data-event-action=deleteEmailTemplate]"(event) {
    event.preventDefault();
    event.stopPropagation();

    Alerts.alert({
      title: i18next.t("mail.templates.alerts.removeEmailTemplateTitle"),
      type: "warning",
      showCancelButton: true,
      confirmButtonText: i18next.t("mail.templates.alerts.removeEmailTemplateConfirm", { title: this.title })
    }, (isConfirm) => {
      if (isConfirm) {
        Meteor.call("templates/email/remove", $(event.currentTarget).data("template-id"));
        Reaction.hideActionView();
      }
    });
  },

  // "click [data-event-action=duplicateEmailTemplate]"(event) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //
  //   Alerts.alert({
  //     title: i18next.t("mail.templates.alerts.duplicateEmailTemplateTitle"),
  //     type: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: i18next.t("mail.templates.alerts.duplicateEmailTemplateConfirm", { title: this.title })
  //   }, (isConfirm) => {
  //     if (isConfirm) {
  //       Meteor.call("templates/email/duplicate", $(event.currentTarget).data("template-id"), this);
  //       Reaction.hideActionView();
  //     }
  //   });
  // },

  "click [data-event-action=editEmailTemplate]"(event) {
    event.preventDefault();

    Reaction.showActionView({
      label: i18next.t("mail.templates.edit"),
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
Template.emailTemplateSettings.helpers({
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
          Alerts.toast(i18next.t("mail.templates.alerts.failedToUpdate", { err: error.message }), "error");
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

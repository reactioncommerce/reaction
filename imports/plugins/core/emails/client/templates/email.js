import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages, Templates } from "/lib/collections";
import { EmailTemplates } from "../../lib/collections/schemas";

Template.emailTemplatesPage.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Templates");
  });
});

Template.emailTemplatesPage.helpers({
  emailTemplate() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      return Templates.find({
        shopId: Reaction.getShopId(),
        type: "email",
        isOriginalTemplate: false
      });
    }
  }
});


/*
 * Template emailTemplatesSettings Helpers
 */
Template.emailTemplateSettings.helpers({

  emailTemplateSchema() {
    return EmailTemplateSchema;
  }
});

/*
 * template emailTemplatesPage events
 */
Template.emailTemplatesPage.events({
  "click [data-event-action=deleteEmailTemplate]"(event) {
    event.preventDefault();
    event.stopPropagation();

    // confirm delete
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


  "click [data-event-action=duplicateEmailTemplate]"(event) {
    event.preventDefault();
    event.stopPropagation();

    Alerts.alert({
      title: i18next.t("mail.templates.alerts.duplicateEmailTemplateTitle"),
      type: "warning",
      showCancelButton: true,
      confirmButtonText: i18next.t("mail.templates.alerts.duplicateEmailTemplateConfirm", { title: this.title })
    }, (isConfirm) => {
      if (isConfirm) {
        Meteor.call("templates/email/duplicate", $(event.currentTarget).data("template-id"), this);
        Reaction.hideActionView();
      }
    });
  },
  "click [data-event-action=editEmailTemplate]"(event) {
    event.preventDefault();

    Reaction.showActionView({
      label: i18next.t("shipping.editShippingMethod"),
      data: this,
      template: "emailTemplateSettings"
    });

    Session.set("updatedMethodObj", "");
    Session.set("selectedMethodObj", this);
  },
  "click [data-event-action=addShippingMethod]"(event) {
    event.preventDefault();

    Reaction.showActionView({
      label: i18next.t("shipping.addShippingMethod"),
      template: "addShippingMethod"
    });
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

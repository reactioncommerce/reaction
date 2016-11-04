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
  // languages() {
  //   const languages = [];
  //   console.log("Languages 1`", languages);
  //   if (Reaction.Subscriptions.Shops.ready() && Meteor.user()) {
  //     const shop = Shops.findOne();
  //     if (typeof shop === "object" && shop.languages) {
  //       for (const language of shop.languages) {
  //         if (language.enabled === true) {
  //           language.translation = "languages." + language.label.toLowerCase();
  //           // appending a helper to let us know this
  //           // language is currently selected
  //           const profile = Meteor.user().profile;
  //           if (profile && profile.lang) {
  //             if (profile.lang === language.i18n) {
  //               language.class = "active";
  //             }
  //           } else if (shop.language === language.i18n) {
  //             // we don't have a profile language
  //             // use the shop default
  //             language.class = "active";
  //           }
  //           languages.push(language);
  //         }
  //       }
  //       if (languages.length > 1) {
  //         return languages;
  //       }
  //     }
  //   }
  //   console.log("Languages 2`", languages);
  //   return languages;
  // }
});


/*
 * Template emailTemplatesPage Helpers
 */
Template.emailTemplatesPage.helpers({
  // shipping() {
  //   return Shipping.find();
  // },
  selectedShippingMethod() {
    const session = Session.get("selectedShippingMethod");
    if (_.isEqual(this, session)) {
      return this;
    }
  },
  selectedAddShippingMethod() {
    const session = Session.get("selectedAddShippingMethod");
    if (_.isEqual(this, session)) {
      return this;
    }
  },
  selectedShippingProvider() {
    const session = Session.get("selectedShippingProvider");
    if (_.isEqual(this, session)) {
      return this;
    }
  }
});
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
        console.log("------this-----", this);
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


// Template.emailTemplateSettings.helpers({
//   "submit #email-template-edit-form"(event) {
//     console.log("this submitblur", this);
//
//     event.preventDefault();
//
//     console.log("this submit", this);
//   }
// });


/*
 * Autoform hooks
 * Because these are some convoluted forms
 */
 // AutoForm.hooks({
 //   "email-template-edit-form": {
 //     onSubmit() {
 //       console.log("hey");
 //     }
 //    //  /* eslint-disable no-unused-vars*/
 //    //  onSuccess: function () {
 //    //    Alerts.removeSeen();
 //    //    return Alerts.toast(i18next.t("searchSettings.settingsSaved"),
 //    //      "success");
 //    //  },
 //    //  onError: function (operation, error) {
 //    //    Alerts.removeSeen();
 //    //    return Alerts.toast(
 //    //      `${i18next.t("searchSettings.settingsFailed")} ${error}`, "error"
 //    //    );
 //    //  }
 //     /* eslint-enable no-unused-vars*/
 //   }
 // });
 // AutoForm.hooks({
 //   "email-template-edit-form": {
 //     /* eslint-disable no-unused-vars*/
 //     onSuccess: function () {
 //       Alerts.removeSeen();
 //       return Alerts.toast(i18next.t("searchSettings.settingsSaved"),
 //         "success");
 //     },
 //     onError: function (operation, error) {
 //       Alerts.removeSeen();
 //       return Alerts.toast(
 //         `${i18next.t("searchSettings.settingsFailed")} ${error}`, "error"
 //       );
 //     }
 //     /* eslint-enable no-unused-vars*/
 //   }
 // });

 // AutoForm.hooks({
 //   "email-template-edit-form": {
 //     onSubmit(insertDoc, updateDoc, currentDoc) {
 //       let error;
 //       // handling case where we are either inserting inline this providers first methods
 //       // or where we are adding additional methods to an existing array of provider methods in the admin panel.
 //       const providerId = Template.instance().parentTemplate(4).$(".delete-shipping-method").data("provider-id");
 //       try {
 //         _.extend(insertDoc, { _id: currentDoc._id });
 //         Meteor.call("shipping/methods/update", providerId, currentDoc._id, insertDoc);
 //         Session.set("updatedMethodObj", insertDoc);
 //         this.done();
 //       } catch (_error) {
 //         error = _error;
 //         this.done(new Error("Submission failed"));
 //       }
 //       return error || false;
 //     },
 //     onSuccess() {
 //       return Alerts.inline(i18next.t("shipping.shippingMethodRateUpdated"), "success", {
 //         autoHide: true,
 //         placement: "shippingPackage"
 //       });
 //     }
 //   }
 // });
//
// AutoForm.hooks({
//   "shipping-provider-add-form": {
//     onSuccess() {
//       Reaction.toggleSession("selectedShippingProvider");
//       return Alerts.inline(i18next.t("shipping.shippingProviderSaved"), "success", {
//         autoHide: true,
//         placement: "shippingPackage"
//       });
//     }
//   }
// });
//
// AutoForm.hooks({
//   "shipping-method-add-form": {
//     onSubmit(insertDoc, updateDoc, currentDoc) {
//       const providerId = currentDoc ?  currentDoc._id : Template.instance().parentTemplate(4).$(".delete-shipping-method").data("provider-id");
//       let error;
//       try {
//         Meteor.call("shipping/methods/add", insertDoc, providerId);
//         this.done();
//       } catch (_error) {
//         error = _error;
//         this.event.preventDefault();
//         this.done(new Error("Submission failed"));
//       }
//       return error || false;
//     },
//     onSuccess() {
//       Reaction.toggleSession("selectedAddShippingMethod");
//       return Alerts.inline(i18next.t("shipping.shippingMethodRateAdded"), "success", {
//         autoHide: true,
//         placement: "shippingPackage"
//       });
//     }
//   }
// });


AutoForm.hooks({
  "email-template-edit-form": {
    onSubmit: function (insertDoc) {
      this.event.preventDefault();

      let templateId = this.docId;

      console.log("templateId", templateId);

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

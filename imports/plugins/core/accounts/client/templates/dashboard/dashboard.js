import _ from "lodash";
import { Components } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
import { ServiceConfiguration } from "meteor/service-configuration";
import { Reaction, i18next } from "/client/api";
import * as Collections from "/lib/collections";
import { ServiceConfigHelper } from "../../helpers/util";

Template.accountsDashboard.onCreated(function () {
  this.autorun(() => {
    this.subscribe("ShopMembers");
  });
});

Template.accountsDashboard.helpers({
  /**
   * isShopMember
   * @returns {Boolean} True if the memnber is an administrator
   * @ignore
   */
  isShopMember() {
    return _.includes(["dashboard", "admin", "owner"], this.role);
  },

  /**
   * isShopGuest
   * @returns {Boolean} True if the member is a guest
   * @ignore
   */
  isShopGuest() {
    return !_.includes(["dashboard", "admin", "owner"], this.role);
  },
  /**
   * members
   * @returns {Boolean} True array of adminsitrative members
   * @ignore
   */
  members() {
    if (Reaction.hasPermission("reaction-accounts")) {
      const shopId = Reaction.getShopId();
      const instance = Template.instance();
      if (instance.subscriptionsReady()) {
        const shopUsers = Meteor.users.find();

        return shopUsers.map((user) => {
          const member = {};

          // Querying the Accounts collection to retrieve user's name because
          // Meteor filters out sensitive info from the Meteor.users schema
          const userSub = Meteor.subscribe("UserAccount", user._id);
          if (userSub.ready()) {
            member.name = Collections.Accounts.findOne(user._id).name;
          }
          member.userId = user._id;

          if (user.emails && user.emails.length) {
            // this is some kind of denormalization. It is helpful to have both
            // of this string and array. Array goes to avatar, string goes to
            // template
            member.emails = user.emails;
            member.email = user.emails[0].address;
          }
          // member.user = user;
          member.username = user.username;
          member.isAdmin = Roles.userIsInRole(user._id, "admin", shopId);
          member.roles = user.roles;
          member.services = user.services;

          if (Roles.userIsInRole(member.userId, "owner", shopId)) {
            member.role = "owner";
          } else if (Roles.userIsInRole(member.userId, "admin", shopId)) {
            member.role = "admin";
          } else if (Roles.userIsInRole(member.userId, "dashboard", shopId)) {
            member.role = "dashboard";
          } else if (Roles.userIsInRole(member.userId, "guest", shopId)) {
            member.role = "guest";
          }

          return member;
        });
      }
    }

    return null;
  },

  accountsDashboard() {
    return Components.AccountsDashboard;
  }
});

Template.accountsSettings.onCreated(function () {
  this.subscribe("ServiceConfiguration", Reaction.getUserId());
});

Template.accountsSettings.helpers({

  /**
   * services
   * @returns {Array} available services
   * @ignore
   */
  services() {
    const serviceHelper = new ServiceConfigHelper();
    const configurations = ServiceConfiguration.configurations.find().fetch();

    // eslint-disable-next-line consistent-return
    const services = serviceHelper.services((item) => {
      const matchingConfigurations = _.filter(configurations, {
        service: item.name
      });
      if (matchingConfigurations.length) {
        return matchingConfigurations[0];
      }
    });

    return services;
  },

  /**
   * Template helper to add a hidden class if the condition is false
   * @param  {Boolean} enabled Service enabled
   * @returns {String}          "hidden" or ""
   * @ignore
   */
  shown(enabled) {
    return enabled !== true ? "hidden" : "";
  },

  /**
   * Return checked classname if true
   * @param  {Boolean} enabled Boolean value true/false
   * @returns {String}          "checked" or ""
   * @ignore
   */
  checked(enabled) {
    return enabled === true ? "checked" : "";
  },

  /**
   * Returns a value from the supplied service object with a field name
   * @param  {String} fieldName name of field to retrive the value for.
   * @param  {Object} service   Service object to find the value in.
   * @returns {String}           A value or blank string if nothing is found.
   * @ignore
   */
  valueForField(fieldName, service) {
    return service[fieldName] || "";
  }
});

Template.accountsSettings.events({
  "submit form": (event) => {
    event.preventDefault();

    const service = event.target.service.value;
    const serviceHelper = new ServiceConfigHelper();
    const fields = serviceHelper.configFieldsForService(service);
    // todo remove this after i18next 2 will be installed
    // let niceName = serviceHelper.capitalizedServiceName(service);

    for (const field of fields) {
      field.value = event.target[field.property].value;
    }

    Meteor.call("accounts/updateServiceConfiguration", service, fields, (error) => {
      if (!error) {
        Alerts.toast(i18next.t(
          "accountsUI.updatedServiceConfiguration",
          { service: i18next.t(`social.${service}`) }
        ));
      }
    });
  },

  "change input[name=enabled]": (event) => {
    const service = event.target.value;
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];

    Meteor.call("accounts/updateServiceConfiguration", service, fields);
  },

  "click [data-event-action=showSecret]": (event) => {
    const button = Template.instance().$(event.currentTarget);
    const input = button.closest(".form-group").find("input[name=secret]");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      button.html("Hide");
    } else {
      input.attr("type", "password");
      button.html("Show");
    }
  }
});

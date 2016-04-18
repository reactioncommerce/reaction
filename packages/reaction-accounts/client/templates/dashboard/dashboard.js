/**
 * Accounts helpers
 */
Template.accountsDashboard.onCreated(function () {
  this.autorun(() => {
    this.subscribe("ShopMembers");
  });
});

Template.accountsDashboard.helpers({
  /**
   * isShopMember
   * @return {Boolean} True if the memnber is an administrator
   */
  isShopMember() {
    let roles = ["dashboard", "admin", "owner"];

    if (_.contains(roles, this.role)) {
      return true;
    }

    return false;
  },

  /**
   * isShopGuest
   * @return {Boolean} True if the member is a guest
   */
  isShopGuest() {
    let roles = ["dashboard", "admin", "owner"];

    if (_.contains(roles, this.role) === false) {
      return true;
    }

    return false;
  },

  /**
   * members
   * @return {Boolean} True array of adminsitrative members
   */
  members: function () {
    if (ReactionCore.hasPermission("reaction-accounts")) {
      const shopId = ReactionCore.getShopId();
      const instance = Template.instance();
      if (instance.subscriptionsReady()) {
        const shopUsers = Meteor.users.find();

        return shopUsers.map(user => {
          let member = {};

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

          if (Roles.userIsInRole(member.userId, "dashboard", shopId)) {
            member.role = "dashboard";
          }

          if (Roles.userIsInRole(member.userId, "admin", shopId)) {
            member.role = "admin";
          }

          if (Roles.userIsInRole(member.userId, "owner", shopId)) {
            member.role = "owner";
          } else if (Roles.userIsInRole(member.userId, "guest", shopId)) {
            member.role = "guest";
          }

          return member;
        });
      }
    }
  }
});

/**
 * Account Settings Helpers
 */
Template.accountsSettings.onCreated(() => {
  Meteor.subscribe("ServiceConfiguration", Meteor.userId());
});

/**
 * Account Settings Helpers
 */
Template.accountsSettings.helpers({

  /**
   * services
   * @return {Array} available services
   */
  services() {
    let serviceHelper = new ReactionServiceHelper();
    let configurations = ServiceConfiguration.configurations.find().fetch();

    let services = serviceHelper.services((item) => {
      let matchingConfigurations = _.where(configurations, {
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
   * @return {String}          "hidden" or ""
   */
  shown(enabled) {
    return enabled !== true ? "hidden" : "";
  },

  /**
   * Return checked classname if true
   * @param  {Boolean} enabled Boolean value true/false
   * @return {String}          "checked" or ""
   */
  checked(enabled) {
    return enabled === true ? "checked" : "";
  },

  /**
   * Returns a value from the supplied service object with a field name
   * @param  {String} fieldName name of field to retrive the value for.
   * @param  {Object} service   Service object to find the value in.
   * @return {String}           A value or blank string if nothing is found.
   */
  valueForField(fieldName, service) {
    return service[fieldName] || "";
  }
});

Template.accountsSettings.events({

  /**
   * Account settings form submit
   * @param  {event} event    jQuery event
   * @return {void}
   */
  "submit form": (event) => {
    event.preventDefault();

    let service = event.target.service.value;
    let serviceHelper = new ReactionServiceHelper();
    let fields = serviceHelper.configFieldsForService(service);
    // todo remove this after i18next 2 will be installed
    // let niceName = serviceHelper.capitalizedServiceName(service);

    for (let field of fields) {
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

  /**
   * Account settings update enabled status for login service on change
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "change input[name=enabled]": (event) => {
    let service = event.target.value;
    let fields = [{
      property: "enabled",
      value: event.target.checked
    }];

    Meteor.call("accounts/updateServiceConfiguration", service, fields);
  },

  /**
   * Account settings show/hide secret key for a service
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "click [data-event-action=showSecret]": (event) => {
    let button = $(event.currentTarget);
    let input = button.closest(".form-group").find("input[name=secret]");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      button.html("Hide");
    } else {
      input.attr("type", "password");
      button.html("Show");
    }
  }
});

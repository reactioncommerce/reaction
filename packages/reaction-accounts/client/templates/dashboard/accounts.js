"use strict";

/**
 * Accounts helpers
 *
 */



//
Template.accountsDashboardControls.events({
  "click [data-event-action=addShopMember]": function () {
    ReactionCore.showActionView({
      label: "Add Shop Member",
      template: "memberForm"
    });
  }
});


Template.accountsDashboard.helpers({

  isShopMember: function () {
    var roles = ["Dashboard", "Administrator", "Owner"];

    if (_.contains(roles, this.role)) {
      return true;
    }

    return false;
  },

  isShopGuest: function () {
    var roles = ["Dashboard", "Administrator", "Owner"];

    if (_.contains(roles, this.role) === false) {
      return true;
    }

    return false;
  },

  members: function() {
    var ShopMembers, members, shopUsers;
    members = [];
    if (ReactionCore.hasPermission('dashboard/accounts')) {

      ShopMembers = Meteor.subscribe('ShopMembers');

      if (ShopMembers.ready()) {

        shopUsers = Meteor.users.find();

        shopUsers.forEach(function(user) {
          var member, _ref;
          member = {};
          member.userId = user._id;

          if (user.email) {
            member.email = (_ref = user.emails[0]) != null ? _ref.address : void 0;
          }

          member.username = user != null ? user.username : void 0;
          member.isAdmin = Roles.userIsInRole(user._id, 'admin', ReactionCore.getShopId());
          member.roles = user.roles;

          if (Roles.userIsInRole(member.userId, 'dashboard', ReactionCore.getShopId())) {
            member.role = "Dashboard";
          }

          if (Roles.userIsInRole(member.userId, 'admin', ReactionCore.getShopId())) {
            member.role = "Administrator";
          }

          if (Roles.userIsInRole(member.userId, 'owner', ReactionCore.getShopId())) {
            member.role = "Owner";
          } else if (Roles.userIsInRole(member.userId, ReactionCore.getShopId(), ReactionCore.getShopId())) {
            member.role = "Guest";
          }

          members.push(member);
        });

        return members;
      }
    }
  }

});

/**
 * coreAccounts events
 *
 */

Template.accountsDashboard.events({
  "click .button-add-member": function(event, template) {
    $('.settings-account-list').hide();
    return $('.member-form').removeClass('hidden');
  },
  "click .permission-toggle": function(event, template) {
    var $this;
    $this = $(event.target);
    $('.permissions-view').hide();
    $this.addClass('open');
    return $this.next('.permissions-view').show();
  },
  "click .button-permissions-close": function(event, template) {
    var $permissionView;
    $permissionView = $(event.target).closest('.permissions-view');
    $permissionView.closest('.permission-toggle').removeClass('open');
    return $permissionView.hide();
  }
});




Template.accountsSettings.onRendered( () => {
  let template = Template.instance();
})


Template.accountsSettings.helpers({
  services() {

    let serviceHelper = new window.ReactionServiceHelper();
    let configurations = ServiceConfiguration.configurations.find().fetch();
    let services = Package['accounts-oauth'] ? Accounts.oauth.serviceNames() : [];



    services = _.map(services, function (name) {

      let serviceName = serviceHelper.getCapitalizedServiceName(name);

      var thing = {
        name: name,
        label: serviceHelper.getCapitalizedServiceName(name),
        buttonType: Template.instance().type || 'signIn',
        fields: serviceHelper.getConfigFieldsForService(name)
      };

      var matchingConfigurations = _.where(configurations, {service: name})

      if (matchingConfigurations.length) {
        thing = _.extend(thing, matchingConfigurations[0])
      }

      return thing

    });

    return services;
  },

  isSecretField(fieldName) {
    return fieldName === "secret";
  },

  valueForField(fieldName, service) {
    return service[fieldName] || "";
  }
})


Template.accountsSettings.events({
  "submit form": (event, template) => {
    event.preventDefault();

    let serviceHelper = new window.ReactionServiceHelper();
    let fields = serviceHelper.getConfigFieldsForService(event.target.service.value);

    for (let field of fields) {
      field.value = event.target[field.property].value;
    }

    Meteor.call("accounts/updateServiceConfiguration", "facebook", fields, function(result) {

    })

  },

  "click [data-event-action=showSecret]": (event, template) => {
    let button = $(event.currentTarget)
    let input = button.closest(".form-group").find("input[name=secret]");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      button.html("Hide");
    } else {
      input.attr("type", "password");
      button.html("Show");
    }
  }
})







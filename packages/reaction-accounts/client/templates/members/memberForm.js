/**
 * memberForm events
 *
 */
Template.memberForm.events({
  "submit form": function (event, template) {
    event.preventDefault();

    let newMemberEmail = template.$('input[name="email"]').val();
    let newMemberName = template.$('input[name="name"]').val();

    return Meteor.call("accounts/inviteShopMember", ReactionCore.getShopId(), newMemberEmail, newMemberName, function (error) {
      if (error) {
        if (error.reason !== "") {
          Alerts.toast(error, "error", {
            html: true,
            timeout: 10000
          });
        } else {
          Alerts.toast("Error sending email, possible configuration issue." + error, "error");
        }
        return false;
      }

      Alerts.toast(i18n.t("accountsUI.info.invitationSent", "Invitation sent."), "success");

      template.$("input[type=text], input[type=email]").val("");
      $(".settings-account-list").show();

      return true;
    });
  }
});

/**
* memberForm events
*
*/
Template.memberForm.events({
  "submit form": function(event, template) {
    var newMemberEmail, newMemberName;
    event.preventDefault();
    newMemberName = template.$('input[name="name"]').val();
    newMemberEmail = template.$('input[name="email"]').val();
    return Meteor.call("inviteShopMember", ReactionCore.getShopId(), newMemberEmail, newMemberName, function(error) {
      if (error != null) {
        console.log(error);
        if (error.reason !== '') {
          Alerts.add(error, "danger", {
            html: true
          });
        } else {
          Alerts.add("Error sending email, possible configuration issue." + error, "danger");
        }
        return false;
      } else {
        Alerts.add(i18n.t("accountsUI.info.invitationSent", "Invitation sent."), "success", {
          autoHide: true
        });
        template.$("input[type=text], input[type=email]").val("");
        $('.settings-account-list').show();
        return true;
      }
    });
  }
});

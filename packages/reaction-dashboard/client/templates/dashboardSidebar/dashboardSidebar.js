Template.dashboardSidebar.events({
    'click .dashboard-back': function (e) {
        ///e.preventDefault;
        history.go(-1);
        return false;
    },
    'click .dashboard-logout': function () {
        event.preventDefault();
        Meteor.logout(function (err) {
            if (err) {
                throwError(err.reason);
            } else {
                Router.go('/');
            }
        });
    }
});

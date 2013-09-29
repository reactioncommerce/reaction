Template._loginButtonsLoggedInDropdownActions.events({
        'click #login-buttons-logout': function () {
            Session.set("currentProject", "");
            clearErrors();
            Router.go('index');
            Meteor.logout();
        }
    });


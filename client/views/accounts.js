Template.user_loggedout.events({
    "submit #login": function(event){
        event.preventDefault();
        var email = $(event.target).find('[id=input-email]').val();
        var password = $(event.target).find('[id=input-password]').val();

        Meteor.loginWithPassword(email,password, function(err){
            if (err) {
              console.log(err);
              // The user might not have been found, or their passwword
              // could be incorrect. Inform the user that their
              // login attempt has failed.
              throwError(err.reason);
            } else {
              // The user has been logged in.
              console.log("user logged in");
            }
        });
    }
});


Template.user_loggedin.events({
    "click #logout": function(event){
        event.preventDefault();
        Meteor.logout(function(err){
            if (err) {
                throwError(err.reason);
            } else {
                Route.go('/');
                console.log("logged out");
            }
        });
    }
});

Template.accountCreateStep1.events({
    'submit #create-account-form' : function(event){
        event.preventDefault();
        // retrieve the input field values
        var options = {
            email: $(event.target).find('[id=input-email]').val(),
            password: $(event.target).find('[id=input-password]').val(),
            profile: {
                name: $(event.target).find('[id=input-name]').val(),
            },
            roles: ['view-dashboard']
        };

        // Trim and validate your fields here....

        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        Accounts.createUser(options, function(err){
            if (err) {
              console.log(err);
              // The user might not have been found, or their passwword
              // could be incorrect. Inform the user that their
              // login attempt has failed.
              throwError(err.reason);
            } else {
              // The user has been logged in.
              console.log("user logged in");
            }
        });
         return false;
    }
});

Template.createprofile.helpers({
    fname: function(){
        var name = Meteor.user().profile.name.split(' ');
        var fname = name[0];
        return fname;
    }
});

Template.createprofile.events({
  'submit #update-profile': function (event) {
    Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.store": $(event.target).find('[id=input-store]').val() }});
  }
});
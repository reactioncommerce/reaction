Template.index.helpers({
    userhasprofile: function() {
            if (!Meteor.user().profile.store){
                return false
            }
        return true;
    }
});
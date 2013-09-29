Template.projects.events({
    'click #broadcastOpen': function(event) {
        $(".broadcast-form").show().height('475');
    }
});

// Observes captures and updates when added/removed/etc
Template.projects.helpers({
    captureCount: function() {
        var currentProjectId = Session.get("currentProjectId");
        var cnt = Counts.findOne({projectId:currentProjectId}).count;
        return cnt;
    }
});
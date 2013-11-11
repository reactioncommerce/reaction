if (Meteor.isServer) {
  Meteor.startup(function () {
    if (CountStats.find().fetch().length === 0) {
      var cursor = Captures.find();
      var statsObserver = cursor.observeChanges({
        added: function (id, fields) {
          //console.log("Capture observer adding initial countstats");
          updateSlug(id);
        },
        changed: function (id, fields) {
          //console.log("Capture observer changed initial countstats");
          updateSlug(id);
        }
      });

      function updateSlug(id) {

        var curdoc = Captures.findOne(id);
        var myDate = curdoc.submitted;
        var captureDate = new Date(myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate());

        CountStats.update(
          {campaignId: curdoc.campaignId, submitted: captureDate},
          { $inc: {"count": 1}}, {upsert: true}
        );
      }
    }
  });
}

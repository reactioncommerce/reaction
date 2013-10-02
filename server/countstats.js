if (Meteor.isServer) {
    Meteor.startup(function () {
        var statsObserver = Captures.find().observe({
            added: updateSlug,
            changed: updateSlug
        });

        function updateSlug(doc, idx) {
                var curdoc = Captures.findOne(doc);
                var myDate = curdoc.submitted;
                var captureDate = new Date(myDate.getFullYear()+"-"+(myDate.getMonth()+1)+"-"+myDate.getDate());

                CountStats.update(
                    {projectId:curdoc.projectId,submitted:captureDate},
                    { $inc: {"count":1}}, {upsert: true}
                );
        }

    });
}
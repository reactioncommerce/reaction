Meteor.publish('allcampaigns', function (shopId,limit) {
  return Campaigns.find({shopId: shopId}, {sort: {submitted: -1}, limit: limit});
});

Meteor.publish('singleCampaign', function (id) {
  return id && Campaigns.find(id);
});


Meteor.publish('campaigns', function (shopId) {
  return Campaigns.find({shopId: shopId});
});

Meteor.publish('captures', function (id) {
  return id && Captures.find({campaignId: id});
});

Meteor.publish('broadcasts', function (id) {
  return id && Campaigns.find(id, {broadcasts: true})
});


Meteor.publish('countstats', function (campaignId) {
  var self = this;
  var uuid = Meteor.uuid();
  var initializing = true;

  var statsObserver = Captures.find({campaignId: campaignId}).observeChanges({
    added: function (id, fields) {
      //console.log("Capture observer adding countstats");
      if (!initializing) {
        updateSlug(id);
      }
    },
    changed: function (id, fields) {
      //console.log("Capture observer changed countstats");
      updateSlug(id);
    }
  });

  // initializing = false;

  // // and signal that the initial document set is now available on the client
  // //
  // self.added("countstats", uuid, {campaignId: campaignId, submitted: submitted, count: count});
  // self.ready();
  // // turn off observe when client unsubs
  // self.onStop(function () {
  //   statsObserver.stop();
  // });
  //

  //TODO have the graphs give us an array of campaigns and return all at once, then observe
  return CountStats.find({}, {sort: {submitted: 1}});

  function updateSlug(campaignId) {

    var curdoc = Captures.findOne(campaignId);
    var myDate = curdoc.submitted;
    var captureDate = new Date(myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate());
    console.log("Capture observer updating countstats");
    CountStats.update(
      {campaignId: curdoc.campaignId, submitted: captureDate},
      { $inc: {"count": 1}}, {upsert: true}
    );
  }
});


// server: publish the current size of a collection
//  TODO: limit to current users campaigns
Meteor.publish("captures-by-campaign", function (campaignId) {
  var self = this;
  var uuid = Meteor.uuid();
  var count = 0;
  var initializing = true;

  var handle = Captures.find({campaignId: campaignId}).observeChanges({
    added: function (doc, idx) {
      count++;
      if (!initializing) {
        self.changed("counts", uuid, {count: count});
      }

    },
    removed: function (doc, idx) {
      count--;
      self.changed("counts", uuid, {count: count});
      //CountStats.update({campaignId:campaignId},{ $set: {"count":count}}, {upsert: true});
    }
    // don't care about moved or changed
  });

  initializing = false;

  // publish the initial count.  observeChanges guaranteed not to return
  // until the initial set of `added` callbacks have run, so the `count`
  // variable is up to date.
  self.added("counts", uuid, {campaignId: campaignId, count: count});

  // and signal that the initial document set is now available on the client
  self.ready();

  // turn off observe when client unsubs
  self.onStop(function () {
    handle.stop();
  });
});

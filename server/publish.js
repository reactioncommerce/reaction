Meteor.publish('allprojects', function(limit) {
  return Projects.find({userId: this.userId}, {sort: {submitted: -1}, limit: limit});
});

Meteor.publish('singleProject', function(id) {
  return id && Projects.find(id);
});


Meteor.publish('projects', function() {
  return Projects.find({userId: this.userId});
});

Meteor.publish('captures', function(id) {
 return id && Captures.find({projectId:id});
});


Meteor.publish('broadcasts', function(id) {
  return id && Projects.find(id,{broadcasts:true})
});


// server: publish the current size of a collection
//  TODO: limit to current users projects
Meteor.publish("captures-by-project", function (projectId) {
  var self = this;
  var uuid = Meteor.uuid();
  var count = 0;
  var initializing = true;

  var handle = Captures.find({projectId: projectId}).observeChanges({
    added: function (doc, idx) {
      count++;
      if (!initializing)
        self.changed("counts", uuid, {count: count});
    },
    removed: function (doc, idx) {
      count--;
      self.changed("counts", uuid, {count: count});
    }
    // don't care about moved or changed
  });

  initializing = false;

  // publish the initial count.  observeChanges guaranteed not to return
  // until the initial set of `added` callbacks have run, so the `count`
  // variable is up to date.
  self.added("counts", uuid, {projectId: projectId, count: count});

  // and signal that the initial document set is now available on the client
  self.ready();

  // turn off observe when client unsubs
  self.onStop(function () {
    handle.stop();
  });
});

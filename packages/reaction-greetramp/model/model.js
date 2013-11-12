// Capture Data
//
//
//
Captures = new Meteor.Collection('Captures');
Counts = new Meteor.Collection('Counts');
CountStats = new Meteor.Collection('CountStats');

// check that the userId specified owns the documents
ownsDocument = function (userId, doc) {
  return doc && doc.userId === userId;
};

// Campaigns
//
//
//

Campaigns = new Meteor.Collection('Campaigns');

Campaigns.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Campaigns.deny({
  update: function (userId, campaign, fieldNames) {
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  campaign: function (campaignAttributes) {
    var user = Meteor.user(),
      campaignWithSameLink = Campaigns.findOne({url: campaignAttributes.url});

    // ensure the user is logged in
    if (!user) {
      throw new Meteor.Error(401, "You need to login to create campaigns");
    }

    // ensure the campaign has a title
    if (!campaignAttributes.title) {
      throw new Meteor.Error(422, 'Please fill in a title');
    }

    // check that there are no previous campaigns with the same link
    if (campaignAttributes.url && campaignWithSameLink) {
      throw new Meteor.Error(302,
        'This link has already been created in a campaign.',
        campaignWithSameLink._id);
    }

    // pick out the whitelisted keys
    var campaign = _.extend(_.pick(campaignAttributes, 'url', 'title'), {
      userId: user._id,
      creator: user.username,
      submitted: new Date().getTime()
    });

    return Campaigns.insert(campaign);
  },
  broadcast: function (broadcastAttributes, campaignId) {
    var user = Meteor.user();
    // ensure the user is logged in
    if (!user) {
      throw new Meteor.Error(401, "You need to login to create broadcasts");
    }

    // ensure the broadcast has a title
    if (!broadcastAttributes.title) {
      throw new Meteor.Error(422, 'Please fill in a title');
    }

    // pick out the whitelisted keys
    var broadcast = _.extend(_.pick(broadcastAttributes, 'broadcasts', 'title', 'url_match', 'start', 'end', 'html'), {
      userId: user._id,
      submitted: new Date().getTime()
    });

    Campaigns.update({"_id": campaignId}, {$push: {broadcasts: broadcast}});
  }
});

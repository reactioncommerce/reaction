Domains = new Meteor.Collection('Domains');
Domains.allow({
  update: ownsDocument,
  remove: ownsDocument
});
Domains.deny({
  update: function(userId, domain, fieldNames) {
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  domain: function(domainAttributes) {
    var user = Meteor.user(),
      domainWithSameLink = Domains.findOne({url: domainAttributes.url});

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to add domains");

    // ensure the domain has a title
    if (!domainAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a title');

    // check that there are no previous Domains with the same link
    if (domainAttributes.url && domainWithSameLink) {
      throw new Meteor.Error(302,
        'This domain has already been created',
        domainWithSameLink._id);
    }

    // pick out the whitelisted keys
    var domain = _.extend(_.pick(domainAttributes, 'url', 'title'), {
        userId: user._id,
        creator: user.username,
        submitted: new Date().getTime(),
        commentsCount: 0,
        upvoters: [],
        votes: 0
    });

    var domainId = Domains.insert(domain);

    return domainId;
  },
    upvote: function(domainId) {
    var user = Meteor.user();
    // ensure the user is logged in
    if (!user)
    throw new Meteor.Error(401, "You need to login to upvote");
        Domains.update({
            _id: domainId,
            upvoters: {$ne: user._id}
        }, {
        $addToSet: {upvoters: user._id},
        $inc: {votes: 1}
    });
  }
});
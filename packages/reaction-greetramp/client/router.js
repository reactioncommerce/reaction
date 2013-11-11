Router.configure({
  //   before: function() {
  //       var routeName = this.context.route.name;
  //       var user = Meteor.user();

  //       if (_.include(['campaigns', 'campaignList' , etc ], routeName) && (!user)) {
  //         this.render(Meteor.loggingIn() ? this.loadingTemplate : 'accessDenied');
  //         return this.stop();
  //   }
  // }
});

Router.map(function () {
  //Header
  this.route('greetramp', {
      path: '/greetramp',
      before: function () {
        Session.set("currentCampaignId", 'overview');
      }
    }
  );
  this.route('campaignsList', {
    path: '/campaigns',
    waitOn: function () {
      Session.set("currentCampaignId", 'all');
      return Meteor.subscribe('allcampaigns', 10);
    },
    data: function () { return { campaigns: Campaigns.find({}, {sort: {submitted: -1}})};},
  });
  this.route('campaigns', {
    path: '/campaigns/:_id',
    waitOn: function () {
      Session.set("currentCampaignId", this.params._id);
      //return Meteor.subscribe('singleCampaign', this.params._id);

      // Wait for the captures count to populate first
      return Meteor.subscribe("captures-by-campaign", this.params._id);
    },
    data: function () {
      Session.set("currentCampaignId", this.params._id);
      return { campaigns: Campaigns.findOne(this.params._id) };
    }
  });
});


Router.configure {}

#   before: function() {
#       var routeName = this.context.route.name;
#       var user = Meteor.user();

#       if (_.include(['campaigns', 'campaignList' , etc ], routeName) && (!user)) {
#         this.render(Meteor.loggingIn() ? this.loadingTemplate : 'accessDenied');
#         return this.stop();
#   }
# }
Router.map ->
  
  #Header
  @route "greetramp",
    path: "/greetramp"
    before: ->
      Session.set "currentCampaignId", "overview"

    controller: ShopController

  @route "campaignsList",
    path: "/campaigns"
    waitOn: ->
      Session.set "currentCampaignId", "all"
      Meteor.subscribe "allcampaigns", 10

    data: ->
      campaigns: Campaigns.find({},
        sort:
          submitted: -1
      )

    controller: ShopController

  @route "campaigns",
    path: "/campaigns/:_id"
    waitOn: ->
      Session.set "currentCampaignId", @params._id
      
      #return Meteor.subscribe('singleCampaign', this.params._id);
      
      # Wait for the captures count to populate first
      Meteor.subscribe "captures-by-campaign", @params._id

    data: ->
      Session.set "currentCampaignId", @params._id
      campaigns: Campaigns.findOne(@params._id)

    controller: ShopController



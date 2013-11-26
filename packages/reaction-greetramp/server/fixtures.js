//Fixture data for greetramp sample
Meteor.startup(function () {
  if (!Captures.find().count()) {
    console.log("Adding greetramp fixture data");
    shops = Shops.find().fetch();
      // Create Test Campaigns and captures for shops
     _.each(shops, function (shop) {
      var now = new Date().getTime();
      console.log("Creating data for:" + shop.name + ":" + shop._id);
      // Random date creation for captures
      function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
      }
      // add test campaigns
      for (var i = 0; i < 6; i++) {
        var campaignId = Campaigns.insert({
          title: 'Campaign #' + i,
          shopId: shop._id,
          url: 'http://google.com/?q=test-' + i,
          submitted: now - i * 3600 * 1000,
          broadcasts: [
            {title: 'Broadcast Sample', url_match: '*', start: '', end: '', html: '<b>Sample Broadcast HTML</b>', created: new Date(), shopId: shop._id}
          ]
        });
        // Add test captures
        var it = Math.floor(Math.random() * 300) + 1;
        for (var c = 0; c < it; c++) {
          Captures.insert({
            campaignId: campaignId,
            broadcastId: '',
            email: 'email' + c + '@localhost' + c + '.com',
            submitted: randomDate(new Date(2013, 7, 1), new Date()),
            referrer: 'localhost',
            ip: '127.0.0.1'
          });
        } // end test captures
      } // end test campaigns
    }); //end shop loop
  } // end shop check
}); // end meteor startup
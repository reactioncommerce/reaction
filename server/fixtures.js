////////////////////////////////////////////////////////////////////
// Startup
//

Meteor.startup(function () {

////////////////////////////////////////////////////////////////////
// Create Test Users
//

if (Meteor.users.find().fetch().length === 0) {

  console.log('Creating sample user and campaign data.');

  var users = [
      {name:"Normal User",email:"normal@ongoworks.com",roles:[]},
      {name:"View Projects User",email:"view@ongoworks.com",roles:['view-projects']},
      {name:"Manage-Users User",email:"manage@ongoworks.com",roles:['manage-users']},
      {name:"Aaron Judd",email:"aaron@ongoworks.com",roles:['admin']},
      {name:"Sara Hicks",email:"sara@ongoworks.com",roles:['admin']}
    ];

  _.each(users, function (userData) {
    var id,
        user;



    userId = Accounts.createUser({
      email: userData.email,
      password: "ongo1",
      profile: { name: userData.name }
    });


    // email verification
    Meteor.users.update({_id: userId}, {$set:{'emails.0.verified': true}});
    Roles.addUsersToRoles(userId, userData.roles);


    ////////////////////////////////////////////////////////////////////
    // Create Test Projects and captures
    //
      var now = new Date().getTime();

      var user = Meteor.users.findOne(userId);

      console.log("Creating data for:"+user.profile.name+ ":"+userId);

      // Random date creation for captures
      function randomDate(start, end) {
          return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
      };

      console.log('Creating test campaigns and sample capture data.');
        // add test projects
        for (var i = 0; i < 8; i++) {
          var projectId = Projects.insert({
            title: 'Campaign #' + i,
            userId: userId,
            url: 'http://google.com/?q=test-' + i,
            submitted: now - i * 3600 * 1000,
            broadcasts: [{title: 'Broadcast Sample',url_match:'*',start:'',end:'',html:'<b>Sample Broadcast HTML</b>',created:new Date(),userId:userId}]
          });
            // Add test captures
            var it =Math.floor(Math.random() * 100) + 1;
            for (var c = 0; c < it; c++) {
                Captures.insert({
                  projectId: projectId,
                  broadcastId:'',
                  email:  'email'+c+'@localhost'+c+'.com',
                  submitted: randomDate(new Date(2013, 8, 1), new Date()),
                  referrer: 'localhost',
                  ip: '127.0.0.1'
                });
            } // end test captures
          } // end test projects
    }); //end user loop
  console.log("Completed setting up fixture data.");
  } // end user check
}); // end meteor startup
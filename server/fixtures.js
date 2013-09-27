////////////////////////////////////////////////////////////////////
// Startup
//

Meteor.startup(function () {

////////////////////////////////////////////////////////////////////
// Create Test Users
//

if (Meteor.users.find().fetch().length === 0) {

  console.log('Creating users: ');

  var users = [
      {name:"Normal User",email:"normal@ongoworks.com",roles:[]},
      {name:"View Projects User",email:"view@ongoworks.com",roles:['view-projects']},
      {name:"Manage-Users User",email:"manage@ongoworks.com",roles:['manage-users']},
      {name:"Aaron Judd",email:"aaronjudd@me.com",roles:['admin']},
      {name:"Sara Hicks",email:"sara@ongoworks.com",roles:['admin']}
    ];

  _.each(users, function (userData) {
    var id,
        user;

    console.log(userData);

    id = Accounts.createUser({
      email: userData.email,
      password: "ongo1",
      profile: { name: userData.name }
    });

    // email verification
    Meteor.users.update({_id: id}, {$set:{'emails.0.verified': true}});
    Roles.addUsersToRoles(id, userData.roles);

  });
}

////////////////////////////////////////////////////////////////////
// Create Test Projects and captures
//
if (Projects.find().count() === 0) {
  var now = new Date().getTime();
  // create two users
  var tomId = Meteor.users.insert({
    profile: { name: 'Tom Coleman' }
  });
  var tom = Meteor.users.findOne(tomId);
  var sachaId = Meteor.users.insert({
    profile: { name: 'Sacha Greif' }
  });
  var sacha = Meteor.users.findOne(sachaId);

  // Random date creation for captures
  function randomDate(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  };
  var it =Math.floor(Math.random() * 100) + 1;
  console.log('Creating test campaigns and sample capture data.');
    // add test projects
    for (var i = 0; i < 305; i++) {
      var projectId = Projects.insert({
        title: 'Campaign # ' + i,
        userId: sacha._id,
        url: 'http://google.com/?q=test-' + i,
        submitted: now - i * 3600 * 1000,
        broadcasts: [{title: 'Broadcast Sample',url_match:'*',start:'',end:'',html:'<b>Sample Broadcast HTML</b>',created:new Date(),userId:sacha._id}]
      });
        // Add test captures
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
  }
});
////////////////////////////////////////////////////////////////////
// Startup
//

Meteor.startup(function () {

  ////////////////////////////////////////////////////////////////////
  // Create Test Users
  //

  if (!Meteor.users.find().count()) {

    console.log("Adding roles fixture data");

    Roles.createRole("admin");
    Roles.createRole("owner");
    Roles.createRole("manager");
    Roles.createRole("vendor");
    Roles.createRole("view-campaigns");
    Roles.createRole("manage-users");

    console.log("Adding users fixture data");

    var users = [
      {
        "_id": "ydFCbJ3TbRXcRJBQ2",
        "services": {
          "password": {
            "srp": {
              "identity": "rJQGKDQ3PWFAYjGKc",
              "salt": "oWTKBszTykSthpERd",
              "verifier": "aad725f1b1d3f35f6afe3e730d648306512b023f1d0e94aa71904a4377b9e5402a5166a8f0eef204db63621b9824fe7a78c2c0e8137a26a2b56e3083f916eba83c7b6eaa4c56de6051e51a120ba99854419654383d143e6c08ca79b7035e450d36658e43f7cbcc5869b62dc9e112308b3850c73e5ef0992ee5a3edb5326e46ea"
            }
          }
        },
        "emails": [
          {
            "address": "normal@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "Normal User"
        }
      },
      {
        "_id": "Cpx5zeNixb9jmePQx",
        "emails": [
          {
            "address": "view@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "View Campaigns User"
        },
        "roles": [
          "view-campaigns"
        ],
        "services": {
          "password": {
            "srp": {
              "identity": "ZmBXJH6rSoARphto6",
              "salt": "FtwWQLWCZ42xvYGCX",
              "verifier": "dd2ebb3652dc6d7c5a0c510314ede562686e90e8f7ac8ff757efc6acf3e32d9da41078d2563da55a72d83ad72717322379800c0afb37b146d041b391ed464b3275c1aeadaab45c56ada07724a34fb6472a14aab630f0c2be961253b39316a0200090e9a7f5e862c44d8b322b0a1be02bf3ee796eebaf713bd2aaab077dbbda55"
            }
          }
        }
      },
      {
        "_id": "WZNkqBaZLRqACDLZ2",
        "emails": [
          {
            "address": "manage@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "Manage-Users User"
        },
        "roles": [
          "manage-users"
        ],
        "services": {
          "password": {
            "srp": {
              "identity": "GeDzsgPvrZn6ZCqk5",
              "salt": "8NRSKnqN7687bPaSh",
              "verifier": "2311f16977567cf0b42b954e8798fb1b1a2cc87dfbd67ae298b44b63d5259a1313aef8465cfd9fbabeaef672e29eab843a6c1cc4ff85b9c1adf765fc7e993b76db7da51ace79cbd7b3339347816ce9b7cab6794435ec5863fd04c9f56251334c91d74460127d8a2ea424d9681baeecd01575f3af1c60db4fd4e4fee4a1521b0f"
            }
          }
        }
      },
      {
        "_id": "sp8nAatBMw7cXKLjc",
        "emails": [
          {
            "address": "aaron@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "Aaron Judd"
        },
        "roles": [
          "admin"
        ],
        "services": {
          "password": {
            "srp": {
              "identity": "K8TCLJrT8zTLbWEN5",
              "salt": "L7vgT6SkS4rpbxAbr",
              "verifier": "8ba76a949bd25e34199fce68bb2257c09af4b69bef91bf2b8bb229409b5e77b4f72fcec67c9db2b5d59a434015d45342bf6b3321b3171bae2ec65616d5d10f812826507cc7823fae1eefb7d8e1ed247efb8dd87419422760286d2b20e984aec411b1804bd573e6a00854fa81d67a81bf2c092f690d5b25fb204df939050e42ee"
            }
          }
        }
      },
      {
        "_id": "fLZ4NiDYpbT8dZXQe",
        "emails": [
          {
            "address": "sara@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "Sara Hicks"
        },
        "roles": [
          "admin"
        ],
        "services": {
          "password": {
            "srp": {
              "identity": "6dserefHaNK2ZRBnd",
              "salt": "F3doYJTaZ3cJAoihW",
              "verifier": "82d42c546dc057b5fc4f3f75d1da02277876f8a5893a8d72ccc0c82f1113e0e227f883b55082f44ce01a65f66997944a47839a9c71655f22e59d8eebad42c1301b5824c946c9fbda4c72ca0b390b8ce0cc7a00bf189a123a7ba49baf1745cb7ac8d98f9ac250fc1230ae0100f572021411f24509a35b1997c34cdbf24d319c7"
            }
          }
        }
      }
    ];

    _.each(users, function (user) {
      Meteor.users.insert(user);

      ////////////////////////////////////////////////////////////////////
      // Create Test Campaigns and captures
      //
      var now = new Date().getTime();

      console.log("Creating data for:" + user.profile.name + ":" + user._id);

      // Random date creation for captures
      function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
      }

      // add test campaigns
      for (var i = 0; i < 6; i++) {
        var campaignId = Campaigns.insert({
          title: 'Campaign #' + i,
          userId: user._id,
          url: 'http://google.com/?q=test-' + i,
          submitted: now - i * 3600 * 1000,
          broadcasts: [
            {title: 'Broadcast Sample', url_match: '*', start: '', end: '', html: '<b>Sample Broadcast HTML</b>', created: new Date(), userId: user._id}
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
    }); //end user loop
  } // end user check
}); // end meteor startup

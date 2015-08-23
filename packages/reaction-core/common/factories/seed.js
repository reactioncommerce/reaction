/**
 * Meteor method seedUsers
 *
 * expose a methods in development mode to create
 * users Factory.users
 *
 * @param {Number} amount of users
 */

if (process.env.NODE_ENV === "development") {
  Meteor.methods({
    seedUsers: function(amount){
      for(var i = 0; i < amount; i++) {
        Factory.create('user');
      }
    },

    upgradeMe: function(){
      return Roles.addUsersToRoles(this.userId, ['admin']);
    }
  });
}

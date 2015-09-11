/**
 * User factory
 *
 */

Factory.define('user', Meteor.users, {
  username: function() {
    return faker.internet.userName() + _.random(0, 1000);
  },

  name: function() {
    return faker.name.findName();
  },

  emails: function() {
    var email = faker.internet.email();
    return [{
      address: email,
      verified: true
    }];
  },

  profile: function() {
    return {
      name: this.name,
      email: faker.internet.email(),
      profilePictureUrl: faker.image.imageUrl()
    };
  },

  gender: function() {
    return ['Either', 'Male', 'Female'][_.random(0, 2)];
  },

  description: function() {
    return faker.lorem.paragraphs(3);
  },

  startTime: function() {
    // needs moment.js package
    // some date within the next month
    return moment().add(_.random(0, 31), 'days').add(_.random(0, 24), 'hours').toDate();
  },

  createdAt: new Date()

});

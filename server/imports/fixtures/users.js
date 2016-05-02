/**
 * User Factory
 * @summary define user Factory
 */
const user = {
  username: function () {
    return faker.internet.userName() + _.random(0, 1000);
  },

  name: function () {
    return faker.name.findName();
  },

  emails: function () {
    let email = faker.internet.email();
    return [{
      address: email,
      verified: true
    }];
  },

  profile: function () {
    return {
      name: this.name,
      email: faker.internet.email(),
      profilePictureUrl: faker.image.imageUrl()
    };
  },

  gender: function () {
    return ["Either", "Male", "Female"][_.random(0, 2)];
  },

  description: function () {
    return faker.lorem.paragraphs(3);
  },

  startTime: function () {
    // needs moment.js package
    // some date within the next month
    return moment().add(_.random(0, 31), "days").add(_.random(0, 24),
      "hours").toDate();
  },

  createdAt: new Date()
};

const registered = {
  roles: {
    [ReactionFaker.shops.getShop()._id]: [
      "account/profile",
      "guest",
      "product",
      "tag",
      "index",
      "cart/checkout",
      "cart/completed"
    ]
  },
  services: {
    password: {
      bcrypt: Random.id(29)
    },
    resume: {
      loginTokens: [
        {
          when: moment().add(_.random(0, 31), "days").add(_.random(0, 24),
            "hours").toDate()
        }
      ]
    }
  }
};

const anonymous = {
  roles: {
    [ReactionFaker.shops.getShop()._id]: [
      "guest",
      "anonymous",
      "product",
      "tag",
      "index",
      "cart/checkout",
      "cart/completed"
    ]
  }
};

export default function () {
  Factory.define("user", Meteor.users, user);

  Factory.define("registeredUser", Meteor.users,
    Object.assign({}, user, registered));

  Factory.define("anonymous", Meteor.users, Object.assign({}, user, anonymous));
}

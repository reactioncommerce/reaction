import faker from "faker";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Factory } from "meteor/dburles:factory";
import { getShop } from "./shops";

export function getUser() {
  const existingUser = Meteor.users.findOne();
  return existingUser || Factory.create("user");
}

export function getUsers(limit = 2) {
  const users = [];
  const existingUsers = Meteor.users.find({}, { limit }).fetch();
  for (let i = 0; i < limit; i += 1) {
    const user = existingUsers[i] || Factory.create("user");
    users.push(user);
  }
  return users;
}


/**
 * User Factory
 * @summary define user Factory
 */
const user = {
  username() {
    return faker.internet.userName() + _.random(0, 1000);
  },

  name() {
    return faker.name.findName();
  },

  emails() {
    const email = faker.internet.email();
    return [{
      address: email,
      verified: true
    }];
  },

  profile() {
    return {
      name: this.name,
      email: faker.internet.email(),
      profilePictureUrl: faker.image.imageUrl()
    };
  },

  gender() {
    return ["Either", "Male", "Female"][_.random(0, 2)];
  },

  description() {
    return faker.lorem.paragraphs(3);
  },

  async startTime() {
    // needs moment.js package
    // some date within the next month
    const mod = await import("moment");
    const moment = mod.default;
    return moment().add(_.random(0, 31), "days").add(
      _.random(0, 24),
      "hours"
    ).toDate();
  },

  createdAt: new Date()
};

const anonymous = {
  roles: {
    [getShop()._id]: [
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

export default async function () {
  const mod = await import("moment");
  const moment = mod.default;

  const registered = {
    roles: {
      [getShop()._id]: [
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
            when: moment().add(_.random(0, 31), "days").add(
              _.random(0, 24),
              "hours"
            ).toDate()
          }
        ]
      }
    }
  };


  Factory.define("user", Meteor.users, user);
  Factory.define(
    "registeredUser", Meteor.users,
    Object.assign({}, user, registered)
  );

  Factory.define("anonymous", Meteor.users, Object.assign({}, user, anonymous));
}

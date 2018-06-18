const findOneMock = jest.fn().mockName("Meteor.users.rawCollection().findOne");

class mockErrorClass {
  constructor(error) {
    this.error = error;
    this.message = error;
  }
}

export const Meteor = {
  apply: jest.fn().mockName("Meteor.apply"),
  call: jest.fn().mockName("Meteor.call"),
  Error: mockErrorClass,
  isClient: false,
  isServer: true,
  methods: jest.fn().mockName("Meteor.methods"),
  settings: {
    public: {}
  },
  users: {
    rawCollection: () => ({
      findOne: findOneMock
    })
  }
};

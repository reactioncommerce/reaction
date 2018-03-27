class mockErrorClass {
  constructor(error) {
    this.error = error;
    this.message = error;
  }
}

export const Meteor = {
  Error: mockErrorClass,
  isClient: false,
  isServer: true,
  settings: {
    public: {}
  }
};

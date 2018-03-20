function withValueMock(invocation, func) {
  return func();
}

export const DDP = {
  _CurrentInvocation: {
    withValue: jest.fn().mockName("DDP._CurrentInvocation.withValue").mockImplementation(withValueMock)
  }
};

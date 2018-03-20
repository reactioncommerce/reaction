import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import getUserFromToken from "./getUserFromToken";

const loginToken = "LOGIN_TOKEN";
const hashedToken = "HASHED_TOKEN";
const fakeUser = {
  _id: "123",
  name: "Bob Builder",
  services: {
    resume: {
      loginTokens: [
        { hashedToken: "HASHED_TOKEN", when: "WHEN" },
        { hashedToken: "HASHED_TOKEN_2", when: "WHEN_2" }
      ]
    }
  }
};

function mockValues(user, expirationFunc) {
  Accounts._hashLoginToken.mockReturnValueOnce(hashedToken);
  Meteor.users.rawCollection().findOne.mockReturnValueOnce(Promise.resolve(user));
  Accounts._tokenExpiration.mockImplementation(expirationFunc);
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("gets the user based on a non-expired token", async () => {
  mockValues(fakeUser, () => new Date(Date.now() + 1000));

  const user = await getUserFromToken(loginToken);
  expect(user).toEqual(fakeUser);

  expect(Accounts._hashLoginToken).toHaveBeenCalledWith(loginToken);
  expect(Meteor.users.rawCollection().findOne).toHaveBeenCalledWith({
    "services.resume.loginTokens.hashedToken": hashedToken
  });
  expect(Accounts._tokenExpiration).toHaveBeenCalledWith("WHEN");
});

test("throws an error for an invalid token", async () => {
  mockValues(undefined, () => new Date(Date.now() + 1000));
  await expect(getUserFromToken(loginToken)).rejects.toThrow("Token invalid");
});

test("throws an error for an expired token", async () => {
  mockValues(fakeUser, () => new Date(Date.now() - 1000));
  await expect(getUserFromToken(loginToken)).rejects.toThrow("Token expired");
});

import getUserFromToken from "./getUserFromToken";
import { rewire as rewire$tokenExpiration, restore as restore$tokenExpiration } from "./tokenExpiration";

const loginToken = "LOGIN_TOKEN";
const hashedToken = "5b4TxnA+4UFjJLDxvntNe8D6VXzVtiRXyKFo8mta+wU=";
const fakeUser = {
  _id: "123",
  name: "Bob Builder",
  services: {
    resume: {
      loginTokens: [
        { hashedToken: "5b4TxnA+4UFjJLDxvntNe8D6VXzVtiRXyKFo8mta+wU=", when: "WHEN" },
        { hashedToken: "HASHED_TOKEN_2", when: "WHEN_2" }
      ]
    }
  }
};

const mockContext = {
  collections: {
    users: {
      findOne: jest.fn().mockName("users.findOne")
    }
  }
};

const mockTokenExpiration = jest.fn().mockName("tokenExpiration");

beforeAll(() => {
  rewire$tokenExpiration(mockTokenExpiration);
});

afterAll(restore$tokenExpiration);

beforeEach(() => {
  jest.clearAllMocks();
});

test("gets the user based on a non-expired token", async () => {
  mockTokenExpiration.mockImplementationOnce(() => new Date(Date.now() + 1000));
  mockContext.collections.users.findOne.mockReturnValueOnce(Promise.resolve(fakeUser));

  const user = await getUserFromToken(loginToken, mockContext);
  expect(user).toEqual(fakeUser);

  expect(mockContext.collections.users.findOne).toHaveBeenCalledWith({
    "services.resume.loginTokens.hashedToken": hashedToken
  });
});

test("throws an error for an invalid token", async () => {
  mockContext.collections.users.findOne.mockReturnValueOnce(Promise.resolve(undefined));
  await expect(getUserFromToken(loginToken, mockContext)).rejects.toThrow("Token invalid");
});

test("throws an error for an expired token", async () => {
  mockTokenExpiration.mockImplementationOnce(() => new Date(Date.now() - 5000));
  mockContext.collections.users.findOne.mockReturnValueOnce(Promise.resolve(fakeUser));
  await expect(getUserFromToken(loginToken, mockContext)).rejects.toThrow("Token expired");
});

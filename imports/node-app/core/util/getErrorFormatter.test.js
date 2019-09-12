import { restore, rewire$Logger } from "./logger";
import getErrorFormatter from "./getErrorFormatter";

const LoggerMock = {
  error: jest.fn().mockName("Logger.error")
};

beforeAll(() => {
  rewire$Logger(LoggerMock);
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(restore);

test("adds random ID and unknown type to all errors", () => {
  const error = {};
  getErrorFormatter()(error);
  expect(typeof error.errorId).toBe("string");
  expect(error.errorId[0]).toBe("c");
  expect(error.type).toBe("unknown");
});

test("Falls back to greppable message", () => {
  const error = { originalError: {} };
  getErrorFormatter()(error);

  expect(LoggerMock.error).toHaveBeenCalledWith(
    {
      errorId: jasmine.any(String)
    },
    "ApolloServer error with no message"
  );
});

test("if originalError is present, logs the error with some additional details", () => {
  const context = { user: { _id: "123", name: "User" } };
  const message = "TEST_ERROR";
  const error = { originalError: new Error(message), path: "PATH" };
  getErrorFormatter(context)(error);

  expect(LoggerMock.error).toHaveBeenCalledWith(
    {
      errorId: jasmine.any(String),
      path: "PATH",
      stack: jasmine.any(String)
    },
    message
  );
});

test("if originalError is validation-error, uses details[0].message", () => {
  const context = { user: { _id: "123", name: "User" } };
  const message = "TEST_ERROR";
  const originalError = new Error("TEST_ORIGINAL_MESSAGE");
  originalError.details = [{ message }];
  originalError.error = "validation-error";

  const error = { originalError, path: "PATH" };
  getErrorFormatter(context)(error);

  expect(LoggerMock.error).toHaveBeenCalledWith(
    {
      errorId: jasmine.any(String),
      path: "PATH",
      stack: jasmine.any(String)
    },
    message
  );
});

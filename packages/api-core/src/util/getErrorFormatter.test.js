import { restore, rewire$Logger } from "./logger.js";
import getErrorFormatter from "./getErrorFormatter.js";

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
  const formattedError = { extensions: {}, path: [], message: "error" };
  const error = {};
  const result = getErrorFormatter()(formattedError, error);
  expect(typeof result.errorId).toBe("string");
  expect(result.errorId[0]).toBe("c");
  expect(result.type).toBe("unknown");
});

test("Falls back to greppable message", () => {
  const formattedError = { extensions: {}, message: "error" };
  const error = { originalError: {} };
  getErrorFormatter()(formattedError, error);

  expect(LoggerMock.error).toHaveBeenCalledWith(
    {
      errorId: jasmine.any(String)
    },
    "ApolloServer error with no message"
  );
});

test("if originalError is present, logs the error with some additional details", () => {
  const formattedError = { extensions: {}, message: "error", path: "PATH" };
  const context = { user: { _id: "123", name: "User" } };
  const message = "TEST_ERROR";
  const error = new Error(message);

  getErrorFormatter(context)(formattedError, error);

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
  const formattedError = { extensions: {}, message: "error", path: "PATH" };
  const context = { user: { _id: "123", name: "User" } };
  const message = "TEST_ERROR";
  const error = new Error("TEST_ORIGINAL_MESSAGE");
  error.details = [{ message }];
  error.error = "validation-error";

  getErrorFormatter(context)(formattedError, error);

  expect(LoggerMock.error).toHaveBeenCalledWith(
    {
      errorId: jasmine.any(String),
      path: "PATH",
      stack: jasmine.any(String)
    },
    message
  );
});

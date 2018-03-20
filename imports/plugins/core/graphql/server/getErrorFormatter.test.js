import { restore, rewire$Logger } from "./meteor";
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

test("if originalError is present, logs the error with some additional details", () => {
  const context = { user: { _id: "123", name: "User" } };
  const error = { originalError: new Error("TEST_ERROR"), path: "PATH" };
  getErrorFormatter(context)(error);

  expect(LoggerMock.error).toHaveBeenCalledWith({
    errorId: jasmine.any(String),
    path: "PATH",
    userId: "123"
  });
});

test("if originalError is present, logs the error with some additional details", () => {
  const context = { user: { _id: "123", name: "User" } };
  const error = { originalError: new Error("TEST_ERROR"), path: "PATH" };
  getErrorFormatter(context)(error);

  expect(LoggerMock.error).toHaveBeenCalledWith({
    errorId: jasmine.any(String),
    path: "PATH",
    userId: "123"
  });
});

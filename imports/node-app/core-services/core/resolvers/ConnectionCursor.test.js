import { Kind } from "graphql/language";
import ConnectionCursor from "./ConnectionCursor.js";

test("has a description", () => {
  expect(ConnectionCursor.description).toMatchSnapshot();
});

describe("serialization", () => {
  test("returns null for null or undefined", () => {
    expect(ConnectionCursor.serialize(undefined)).toBe(null);
    expect(ConnectionCursor.serialize(null)).toBe(null);
  });

  test("returns base64-encoded value when given a string", () => {
    expect(ConnectionCursor.serialize("123")).toBe("MTIz");
  });
});

describe("value parsing", () => {
  test("handles null or undefined", () => {
    expect(ConnectionCursor.parseValue(undefined)).toBe(null);
    expect(ConnectionCursor.parseValue(null)).toBe(null);
  });

  test("decodes base64-encoded value when given a string", () => {
    expect(ConnectionCursor.parseValue("MTIz")).toBe("123");
  });
});

describe("literal parsing", () => {
  test("decodes base64-encoded value when given a string", () => {
    const literal = {
      kind: Kind.STRING,
      value: "MTIz"
    };

    expect(ConnectionCursor.parseLiteral(literal)).toBe("123");
  });
});

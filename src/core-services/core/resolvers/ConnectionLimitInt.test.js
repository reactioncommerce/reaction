import { Kind } from "graphql/language";
import ConnectionLimitInt from "./ConnectionLimitInt.js";

test("has a description", () => {
  expect(ConnectionLimitInt.description).toMatchSnapshot();
});

describe("serialization", () => {
  test("returns whatever is given", () => {
    expect(ConnectionLimitInt.serialize(undefined)).toBe(undefined);
    expect(ConnectionLimitInt.serialize(null)).toBe(null);
    expect(ConnectionLimitInt.serialize(1)).toBe(1);
    expect(ConnectionLimitInt.serialize(100)).toBe(100);
    expect(ConnectionLimitInt.serialize(200)).toBe(200);
  });
});

describe("value parsing", () => {
  test("returns what is given if it's a number between 1 and 200, inclusive, or undefined", () => {
    expect(ConnectionLimitInt.parseValue(1)).toBe(1);
    expect(ConnectionLimitInt.parseValue(2)).toBe(2);
    expect(ConnectionLimitInt.parseValue(10)).toBe(10);
    expect(ConnectionLimitInt.parseValue(50)).toBe(50);
    expect(ConnectionLimitInt.parseValue(200)).toBe(200);
    expect(ConnectionLimitInt.parseValue(undefined)).toBe(undefined);
  });

  test("returns 200 if over 200", () => {
    expect(ConnectionLimitInt.parseValue(null)).toBe(200);
    expect(ConnectionLimitInt.parseValue(201)).toBe(200);
    expect(ConnectionLimitInt.parseValue(500)).toBe(200);
  });

  test("returns 1 if under 1", () => {
    expect(ConnectionLimitInt.parseValue(0)).toBe(1);
    expect(ConnectionLimitInt.parseValue(-10)).toBe(1);
  });

  test("returns undefined for isNaN", () => {
    expect(ConnectionLimitInt.parseValue(parseInt("f", 10))).toBe(undefined);
  });
});

const getLiteralForInt = (value) => ({ kind: Kind.INT, value });

describe("literal parsing", () => {
  test("returns what is given if it's a number between 1 and 200, inclusive", () => {
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(1))).toBe(1);
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(2))).toBe(2);
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(10))).toBe(10);
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(50))).toBe(50);
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(200))).toBe(200);
  });

  test("returns 200 if over 200", () => {
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(201))).toBe(200);
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(500))).toBe(200);
  });

  test("returns 1 if under 1", () => {
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(0))).toBe(1);
    expect(ConnectionLimitInt.parseLiteral(getLiteralForInt(-10))).toBe(1);
  });
});

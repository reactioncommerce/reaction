import { jest } from "@jest/globals";
import config from "./config.js";
import encodeOpaqueId from "./encodeOpaqueId.js";

jest.mock("./config.js", () => ({
  __esModule: true, // this property makes it work
  default: {
    REACTION_SHOULD_ENCODE_IDS: true
  }
}));

const id = "by5wpdg3nMq8gX54c";
const encodedId = "cmVhY3Rpb24vc2hvcDpieTV3cGRnM25NcThnWDU0Yw==";

test("encodes to base64", () => {
  expect(encodeOpaqueId("reaction/shop", id)).toBe(encodedId);
});

test("skips encoding in REACTION_SHOULD_ENCODE_IDS env is false", async () => {
  config.REACTION_SHOULD_ENCODE_IDS = false;
  expect(encodeOpaqueId("reaction/shop", id)).toBe(id);
  config.REACTION_SHOULD_ENCODE_IDS = true;
});

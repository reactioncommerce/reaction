import MongoFileCollection from "./MongoFileCollection";

const collection = {};

const stores = [
  { on() {} }
];

test("throws if missing collection option", () => {
  expect(() => {
    new MongoFileCollection("foo", { stores }); // eslint-disable-line no-new
  }).toThrow('You must pass the "collection" option');
});

test("throws if missing makeNewStringID option", () => {
  expect(() => {
    new MongoFileCollection("foo", { collection, stores }); // eslint-disable-line no-new
  }).toThrow('You must pass a function for the "makeNewStringID" option');
});

import FileRecord from "./FileRecord";

/**
 * @returns {FileRecord} mock file record
 */
function getFileRecord() {
  return new FileRecord({
    _id: "123",
    copies: {
      fakeStore: {
        key: "key"
      }
    }
  });
}

test("throws error if you don't attach a collection", () => {
  const fileRecord = getFileRecord();
  expect(() => fileRecord.url()).toThrow("FileRecord.url: File must have attached collection");
});

test("throws error if you don't pass a store", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  expect(() => fileRecord.url()).toThrow("FileRecord.url: store is required");
});

test("throws error if the copy does not have a name", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  expect(() => fileRecord.url({ store: "fakeStore" })).toThrow("FileRecord.url: filename is required");
});

test("defaults", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  fileRecord.name("some_name.jpg", { store: "fakeStore" });
  expect(fileRecord.url({ store: "fakeStore" })).toBe("/files/FakeCollection/123/fakeStore/some_name.jpg");
});

/**
 * @param {String} prefix prefix to test
 * @param {String} expected expected result
 * @returns {void} null
 */
function runGlobalPrefixTest(prefix, expected = "/foo/FakeCollection/123/fakeStore/some_name.jpg") {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  fileRecord.name("some_name.jpg", { store: "fakeStore" });
  const previousPrefix = FileRecord.downloadEndpointPrefix;
  FileRecord.downloadEndpointPrefix = prefix;
  expect(fileRecord.url({ store: "fakeStore" })).toBe(expected);
  FileRecord.downloadEndpointPrefix = previousPrefix;
}

test("custom global prefix - no slashes", () => {
  runGlobalPrefixTest("foo");
});

test("custom global prefix - beginning slash", () => {
  runGlobalPrefixTest("/foo");
});

test("custom global prefix - ending slash", () => {
  runGlobalPrefixTest("foo/");
});

test("custom global prefix - both slash", () => {
  runGlobalPrefixTest("/foo/");
});

test("custom global prefix - multi-part", () => {
  runGlobalPrefixTest("/foo/bar", "/foo/bar/FakeCollection/123/fakeStore/some_name.jpg");
});

test("custom prefix", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  fileRecord.name("some_name.jpg", { store: "fakeStore" });
  expect(fileRecord.url({ prefix: "pre", store: "fakeStore" })).toBe("/pre/FakeCollection/123/fakeStore/some_name.jpg");
});

test("absolute throws error if no absolute prefix set", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  fileRecord.name("some_name.jpg", { store: "fakeStore" });
  expect(() => fileRecord.url({ absolute: true, store: "fakeStore" })).toThrow("FileRecord.url: Requested absolute URL without setting absoluteUrlPrefix");
});

test("absolute", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  fileRecord.name("some_name.jpg", { store: "fakeStore" });
  FileRecord.absoluteUrlPrefix = "https://some.thing.cool";
  expect(fileRecord.url({
    absolute: true,
    store: "fakeStore"
  })).toBe("https://some.thing.cool/files/FakeCollection/123/fakeStore/some_name.jpg");
  FileRecord.absoluteUrlPrefix = undefined;
});

test("absolute with prefix option with ending slash", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  fileRecord.name("some_name.jpg", { store: "fakeStore" });
  expect(fileRecord.url({
    absolute: true,
    absoluteUrlPrefix: "https://blah.blah/",
    store: "fakeStore"
  })).toBe("https://blah.blah/files/FakeCollection/123/fakeStore/some_name.jpg");
});

test("adds download param", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  fileRecord.name("some_name.jpg", { store: "fakeStore" });
  expect(fileRecord.url({ download: true, store: "fakeStore" })).toBe("/files/FakeCollection/123/fakeStore/some_name.jpg?download=1");
});

test("merges download param with arbitrary query string params", () => {
  const fileRecord = getFileRecord();
  fileRecord.collectionName = "FakeCollection";
  fileRecord.name("some_name.jpg", { store: "fakeStore" });
  expect(fileRecord.url({
    download: true,
    query: {
      alt: 1,
      foo: "bar"
    },
    store: "fakeStore"
  })).toBe("/files/FakeCollection/123/fakeStore/some_name.jpg?alt=1&download=1&foo=bar");
});

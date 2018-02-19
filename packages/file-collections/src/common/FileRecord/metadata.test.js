import FileRecord from "./FileRecord";

test("can set and get metadata on fileRecord", () => {
  const fileRecord = new FileRecord();
  const metadata = { a: "foo", b: "bar" };

  expect(fileRecord.metadata.a).toBe(undefined);
  fileRecord.metadata = metadata;
  expect(fileRecord.metadata).toEqual(metadata);
  expect(fileRecord.document.metadata).toEqual(metadata);
  expect(fileRecord.metadata.a).toBe("foo");

  fileRecord.metadata.a = null;
  expect(fileRecord.metadata).toEqual({ a: null, b: "bar" });
  expect(fileRecord.document.metadata).toEqual({ a: null, b: "bar" });
  expect(fileRecord.metadata.a).toBe(null);
});

test("can set metadata prop directly", () => {
  const fileRecord = new FileRecord();

  expect(fileRecord.metadata.a).toBe(undefined);
  fileRecord.metadata.a = "foo";
  expect(fileRecord.metadata).toEqual({ a: "foo" });
  expect(fileRecord.document.metadata).toEqual({ a: "foo" });
  expect(fileRecord.metadata.a).toBe("foo");
});

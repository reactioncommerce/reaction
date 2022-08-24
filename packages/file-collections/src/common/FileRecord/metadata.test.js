import FileRecord from "./FileRecord";

test("can set and get metadata on fileRecord", () => {
  const fileRecord = new FileRecord();
  const metadata = { alpha: "foo", beta: "bar" };

  expect(fileRecord.metadata.alpha).toBe(undefined);
  fileRecord.metadata = metadata;
  expect(fileRecord.metadata).toEqual(metadata);
  expect(fileRecord.document.metadata).toEqual(metadata);
  expect(fileRecord.metadata.alpha).toBe("foo");

  fileRecord.metadata.alpha = null;
  expect(fileRecord.metadata).toEqual({ alpha: null, beta: "bar" });
  expect(fileRecord.document.metadata).toEqual({ alpha: null, beta: "bar" });
  expect(fileRecord.metadata.alpha).toBe(null);
});

test("can set metadata prop directly", () => {
  const fileRecord = new FileRecord();

  expect(fileRecord.metadata.a).toBe(undefined);
  fileRecord.metadata.alpha = "foo";
  expect(fileRecord.metadata).toEqual({ alpha: "foo" });
  expect(fileRecord.document.metadata).toEqual({ alpha: "foo" });
  expect(fileRecord.metadata.alpha).toBe("foo");
});

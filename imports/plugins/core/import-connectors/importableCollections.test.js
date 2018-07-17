import { registerImportableCollection } from "./importableCollections";

test("registerImportableCollection throws an error if impColl is not valid", () => {
  expect(() => {
    registerImportableCollection({});
  }).toThrow();
  expect(() => {
    registerImportableCollection({
      collection: "Products",
      importSchema: []
    });
  }).toThrow();
  expect(() => {
    registerImportableCollection({
      collection: "Products",
      importSchema: [
        {
          saveToField: "_id",
          label: "ID"
        }
      ]
    });
  }).toThrow();
  expect(() => {
    registerImportableCollection({
      collection: "Products",
      importSchema: [
        {
          label: "ID",
          saveToField: "_id"
        }
      ]
    });
  }).toThrow();
  expect(() => {
    registerImportableCollection({
      collection: "Products",
      importSchema: [
        {
          key: "_id",
          label: "ID"
        }
      ]
    });
  }).toThrow();
});

test("registerImportableCollection returns true if impColl is valid", () => {
  const result = registerImportableCollection({
    collection: "Products",
    importSchema: [
      {
        key: "_id",
        label: "ID",
        saveToField: "_id"
      }
    ]
  });
  expect(result).toEqual(true);
});

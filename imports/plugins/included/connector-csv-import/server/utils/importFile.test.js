import path from "path";
import { processImportFile, readCSVFile } from "./importFile";

const sampleFilePath = path.resolve("./imports/plugins/included/connector-file-import/server/utils/products.csv");

test("readCSVFile throws an error if file does not exist", () => {
  const filePath = path.resolve("./throw.csv");
  return expect(readCSVFile(filePath)).rejects.toBeTruthy();
});

// TODO: throws an error if file is not a valid csv

test("readCSVFile transforms a CSV file into an array of arrays", () => expect(readCSVFile(sampleFilePath)).resolves.toHaveLength(2));

test("processImportFile returns an empty array", () => expect(processImportFile({}, [])).resolves.toEqual([]));

test("processImportFile correctly processes import files", () => {
  const importFile = {
    method: "local",
    hasHeader: true,
    local: {
      filePath: sampleFilePath
    },
    mapping: {
      Title: "title"
    }
  };
  const schema = [
    {
      key: "title",
      required: true
    }
  ];
  const result = [
    {
      title: "Example Pants"
    }
  ];
  return expect(processImportFile(importFile, schema)).resolves.toEqual(result);
});

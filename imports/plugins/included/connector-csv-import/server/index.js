import { setupFileImportHook, addFileImportJob } from "./jobs/fileImport";
import "./methods/importJobsMethods";
import "./publications/csvImports";

export { default as importableCollections } from "../lib/importableCollections";

setupFileImportHook();
addFileImportJob();

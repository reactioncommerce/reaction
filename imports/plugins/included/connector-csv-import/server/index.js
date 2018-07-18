import { setupFileImportHook, addFileImportJob } from "./jobs/fileImport";
import "./methods/importJobsMethods";
import "./publications/csvImports";

setupFileImportHook();
addFileImportJob();

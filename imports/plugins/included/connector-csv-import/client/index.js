import { registerImportableCollection } from "@reactioncommerce/reaction-import-connectors";
import { ProductsImpColl, TagsImpColl } from "../lib/importableCollections";
import "./templates/csvImport.html";
import "./templates/csvImport.js";

registerImportableCollection(ProductsImpColl);
registerImportableCollection(TagsImpColl);

export { default as CSVImport } from "./containers/csvImport";


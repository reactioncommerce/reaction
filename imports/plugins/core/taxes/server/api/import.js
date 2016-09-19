import { Reaction } from "/server/api";
import { Import } from "/server/api/core/import";
import * as Collections from "../../lib/collections";

// plugin Import helpers
const TaxImport = Import;

// Import helper to store a taxCode in the import buffer.
TaxImport.taxCode = function (key, taxCode) {
  return this.object(Collections.TaxCodes, key, taxCode);
};

// configure Import key detection
TaxImport.indication("ssuta", Collections.TaxCodes, 0.5);

// should assign to global
Object.assign(Reaction.Import, TaxImport);

// exports Reaction.Import with new taxcode helper
export default Reaction;

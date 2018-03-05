import { Reaction } from "/server/api";
import { Importer } from "/server/api/core/importer";
import * as Collections from "../../lib/collections";

// plugin Import helpers
const TaxImport = Importer;

// Import helper to store a taxCode in the import buffer.
TaxImport.taxCode = function (key, taxCode) {
  return this.object(Collections.TaxCodes, key, taxCode);
};

// configure Import key detection
TaxImport.indication("ssuta", Collections.TaxCodes, 0.5);

// should assign to global
Object.assign(Reaction.Importer, TaxImport);

// exports Reaction.Importer with new taxcode helper
export default Reaction;

import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Importer } from "/imports/plugins/core/core/server/Reaction/importer";
import * as Collections from "../../lib/collections";

// plugin Import helpers
const DiscountImport = Importer;

// Import helper to store a discountRate in the import buffer.
DiscountImport.discountRate = function (key, discountRate) {
  return this.object(Collections.Discounts, key, discountRate);
};

// configure Import key detection
DiscountImport.indication("discount", Collections.Discounts, 0.5);

// should assign to global
Object.assign(Reaction.Importer, DiscountImport);

// exports Reaction.Importer with new discount helper
export default Reaction;

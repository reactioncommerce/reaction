import { Reaction } from "/server/api";
import { Import } from "/server/api/core/import";
import * as Collections from "../../lib/collections";

// plugin Import helpers
const DiscountImport = Import;

// Import helper to store a discountRate in the import buffer.
DiscountImport.discountRate = function (key, discountRate) {
  return this.object(Collections.Discounts, key, discountRate);
};

// configure Import key detection
DiscountImport.indication("discount", Collections.Discounts, 0.5);

// should assign to global
Object.assign(Reaction.Import, DiscountImport);

// exports Reaction.Import with new discount helper
export default Reaction;

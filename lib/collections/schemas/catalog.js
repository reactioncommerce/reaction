
import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Catalog = new SimpleSchema({
  contentType: {
    type: String
  },
  media: {
    type: Object,
    blackbox: true
  },
  variants: {
    type: Object,
    blackbox: true
  }
});

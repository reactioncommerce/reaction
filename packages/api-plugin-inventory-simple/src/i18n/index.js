import en from "./en.json";
import es from "./es.json";

//
// we want all the files in individual
// imports for easier handling by
// automated translation software
//
export default {
  translations: [
    ...en,
    ...es
  ]
};

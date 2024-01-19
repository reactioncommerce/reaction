import en from "./en.json" assert { type: "json" };
import es from "./es.json" assert { type: "json" };

//
// we want all the files in individual
// imports for easier handling by
// automated translation software
//
export default {
  translations: [...en, ...es]
};

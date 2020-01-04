import en from "./en.json";
import pt from "./pt.json";

//
// we want all the files in individual
// imports for easier handling by
// automated translation software
//
export default {
  translations: [
    ...en,
    ...pt
  ]
};

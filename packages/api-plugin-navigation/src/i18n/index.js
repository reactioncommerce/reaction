import en from "./en.json" assert { type: "json" };
import es from "./es.json" assert { type: "json" };

export default {
  translations: [...en, ...es]
};

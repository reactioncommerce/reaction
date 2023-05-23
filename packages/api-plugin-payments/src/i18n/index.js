import ar from "./ar.json" assert { type: "json" };
import bg from "./bg.json" assert { type: "json" };
import de from "./de.json" assert { type: "json" };
import el from "./el.json" assert { type: "json" };
import en from "./en.json" assert { type: "json" };
import es from "./es.json" assert { type: "json" };
import fr from "./fr.json" assert { type: "json" };
import he from "./he.json" assert { type: "json" };
import hr from "./hr.json" assert { type: "json" };
import it from "./it.json" assert { type: "json" };
import my from "./my.json" assert { type: "json" };
import nb from "./nb.json" assert { type: "json" };
import nl from "./nl.json" assert { type: "json" };
import pl from "./pl.json" assert { type: "json" };
import pt from "./pt.json" assert { type: "json" };
import ro from "./ro.json" assert { type: "json" };
import ru from "./ru.json" assert { type: "json" };
import sl from "./sl.json" assert { type: "json" };
import sv from "./sv.json" assert { type: "json" };
import tr from "./tr.json" assert { type: "json" };
import vi from "./vi.json" assert { type: "json" };
import zh from "./zh.json" assert { type: "json" };

//
// we want all the files in individual
// imports for easier handling by
// automated translation software
//
export default {
  translations: [
    ...ar,
    ...bg,
    ...de,
    ...el,
    ...en,
    ...es,
    ...fr,
    ...he,
    ...hr,
    ...it,
    ...my,
    ...nb,
    ...nl,
    ...pl,
    ...pt,
    ...ro,
    ...ru,
    ...sl,
    ...sv,
    ...tr,
    ...vi,
    ...zh
  ]
};

import { loadTranslations } from "/server/startup/i18n";

import ar from "./ar.json";
import bg from "./bg.json";
import cs from "./cs.json";
import de from "./de.json";
import el from "./el.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import he from "./he.json";
import hr from "./hr.json";
import hu from "./hu.json";
import it from "./it.json";
import my from "./my.json";
import nb from "./nb.json";
import nl from "./nl.json";
import pl from "./pl.json";
import pt from "./pt.json";
import ro from "./ro.json";
import ru from "./ru.json";
import sl from "./sl.json";
import sv from "./sv.json";
import tr from "./tr.json";
import vi from "./vi.json";
import zh from "./zh.json";

//
// we want all the files in individual
// imports for easier handling by
// automated translation software
//
loadTranslations([ar, bg, cs, de, el, en, es, fr, he, hr, hu, it, my, nb, nl, pl, pt, ro, ru, sl, sv, tr, vi, zh]);

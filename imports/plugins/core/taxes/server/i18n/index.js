import { loadTranslations } from "/server/startup/i18n";
import ar from "./ar.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import he from "./he.json";
import pt from "./pt.json";
import ro from "./ro.json";
import ru from "./ru.json";
import zh from "./zh.json";

//
// we want all the files in individual
// imports for easier handling by
// automated translation software
//

loadTranslations([ar, de, en, es, fr, he, pt, ro, ru, zh]);

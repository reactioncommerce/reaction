import { loadTranslations } from "/server/startup/i18n";

import en from "./en.json";

//
// we want all the files in individual
// imports for easier handling by
// automated translation software
//
loadTranslations([en]);

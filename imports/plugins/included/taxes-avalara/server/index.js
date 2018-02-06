import "./hooks";
import "./i18n";
import { cleanupAvalogs, setupAvalaraCleanupHook } from "./jobs/cleanup";

setupAvalaraCleanupHook();
cleanupAvalogs();

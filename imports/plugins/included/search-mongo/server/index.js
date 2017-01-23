import "./publications/searchresults";
import "./hooks/search";
import "./jobs";
import buildSearchCollectionJob from "./jobs/buildSearchCollections";
import "./i18n";

export * from "./publications/searchresults";

buildSearchCollectionJob();

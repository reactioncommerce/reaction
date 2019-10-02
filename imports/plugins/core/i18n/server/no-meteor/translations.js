import merge from "lodash/merge";

const GET_MULTI_RESOURCES_PATH = "/locales/resources.json";
const GET_NAMESPACES_PATH = "/locales/namespaces.json";

// i18next browser lib always sends a language so this is only
// used if you hit the route directly.
const DEFAULT_LANGUAGE = "en";

// i18next browser lib always sends a namespace so this is only
// used if you hit the route directly.
const DEFAULT_NAMESPACE = "core";

const resources = {};
const namespacesSet = new Set();
let namespaces;

/**
 * @summary Call this to add translation objects. Mutates `resources` and `namespaces`.
 * @param {Object} translation Object with `i18n`, `ns`, and `translation` keys
 * @return {undefined}
 */
export function mergeResource(translation) {
  merge(resources, {
    [translation.i18n]: translation.translation
  });

  // Doing it this way to ensure each namespace is listed only once
  namespacesSet.add(translation.ns);
  namespaces = [...namespacesSet];
}

/**
 * @summary Adds i18next translation routes to an Express app
 * @param {Object} expressApp Express app instance
 * @return {undefined}
 */
export function addTranslationRoutes(expressApp) {
  expressApp.get(GET_MULTI_RESOURCES_PATH, (req, res) => {
    const { lng = DEFAULT_LANGUAGE, ns = DEFAULT_NAMESPACE } = req.query;

    // Default behavior of i18next browser client is to separate multiple
    // lng and ns with `+`, which becomes a space-delimited string on this end.
    const requestedLanguages = lng.split(" ");
    const requestedNamespaces = ns.split(" ");

    // Filter `resources` as requested before sending back.
    // We always include all requested languages and namespaces
    // to avoid the browser throwing load errors. But if the language
    // or namespace was not registered by any plugin, then the
    // translations will be just an empty {}.
    const filteredResources = {};
    for (const language of requestedLanguages) {
      filteredResources[language] = {};
      const lngObj = resources[language] || {};
      for (const namespace of requestedNamespaces) {
        filteredResources[language][namespace] = lngObj[namespace] || {};
      }
    }

    res.json(filteredResources);
  });

  // Because Reaction's namespace list is fluid -- any plugin can add any namespace
  // it wants -- we provide a route where the browser code can get the full list
  // on page load.
  expressApp.get(GET_NAMESPACES_PATH, (req, res) => {
    res.json(namespaces);
  });
}

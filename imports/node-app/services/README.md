# Services
This folder is where services will live temporarily before being broken out into separate networked apps.

## Create a new service

1. Add a folder with the name of the service to this `/services` folder.
1. Add `index.js` in the folder, with code similar to this:
    ```js
    const app = new ReactionService({ graphqlResolvers, graphqlSchemas });
    configurePlugins(app);
    app.start();
    export default app;
    ```
1. The `ReactionService` class is imported from `/services/ReactionService` (to eventually move to an NPM package). You may subclass it as necessary to add features unique to your service, which plugins can make use of in `configurePlugins`.
1. Add `configurePlugins.js` alongside `index.js` in the service folder. This is the one file that is expected to be customized, where admins can import and configure the plugins they install. It should have this base code:
    ```js
    export default function configurePlugins(app) {
    }
    ```
1. Plugins can be NPM packages, or they can live within the service. If keeping the code within the service, follow the pattern of putting them in a `plugins` folder with one folder per plugin within that. Each plugin should export everything needed to configure it from a root `index.js` file. In `configurePlugins.js`, you would then do something like this: `import { getShippingPrices, graphqlResolvers, graphqlSchemas } from "./plugins/flat-rate";`. Or `"./plugins/flat-rate"` might instead be `@reactioncommerce/flat-rate-fulfillment-plugin`;

# Services
This folder is where core services will live temporarily before being broken out into separate networked apps.

## Create a new service

1. Add a folder with the name of the service to this `/services` folder.
1. Add `index.js` in the folder, with code similar to this:
    ```js
    const app = new ReactionService({ graphqlResolvers, graphqlSchemas });
    configurePlugins(app);
    app.start();
    export default app;
    ```
1. The `ReactionService` class is imported from `/imports/node-app/core/ReactionService` (to eventually move to an NPM package). You may subclass it as necessary to add features unique to your service, which plugins can make use of.

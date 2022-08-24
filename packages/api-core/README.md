# Reaction API Core

This NPM package provides the `ReactionAPICore` class. Use this to build a NodeJS microservice that is compatible with the Reaction Commerce platform, or to build your main Reaction Commerce API if you don't want to start by forking the `https://github.com/reactioncommerce/reaction` project.

If you're just looking to run the default Reaction release with all built-in plugins for development, demos, or evaluation, use the released Docker images and the [Reaction Development Platform](https://github.com/reactioncommerce/reaction-development-platform) instead.

This NPM package also provides the `ReactionTestAPICore` class, which you can use to write automated tests that run GraphQL queries against your API with a real database connection. This class is almost identical to the `ReactionAPICore` class, except that no actual GraphQL server is created and various additional methods are available to help with common testing needs.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation](#installation)
- [Usage](#usage)
  - [Included Features](#included-features)
- [Supported Environment Variables](#supported-environment-variables)
- [ReactionAPICore Configuration](#reactionapicore-configuration)
- [Plugins](#plugins)
  - [Plugin Configuration](#plugin-configuration)
    - [auth](#auth)
    - [collections](#collections)
    - [contextAdditions](#contextadditions)
    - [expressMiddleware](#expressmiddleware)
    - [functionsByType](#functionsbytype)
    - [graphQL](#graphql)
    - [mutations and queries](#mutations-and-queries)
- [App Context](#app-context)
- [Writing Tests Using ReactionTestAPICore](#writing-tests-using-reactiontestapicore)
- [Developer Certificate of Origin](#developer-certificate-of-origin)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```sh
npm install @reactioncommerce/api-core graphql
```

The `graphql` package is a required peer dependency.

## Usage

Here is example usage assuming Node 12.14.1 with experimental modules enabled.

```js
import { ReactionAPICore } from "@reactioncommerce/api-core";
import registerFooPlugin from "reaction-plugin-foo";
import Logger from "@reactioncommerce/logger";
import packageJson from "../package.json";

const api = new ReactionAPICore({
  // See "ReactionAPICore Configuration" section. Many options are also configured
  // by environment variables. See "Supported Environment Variables" section.
  serveStaticPaths: ["public"],
  version: packageJson.version
});

async function run() {
  // Call this once per plugin.
  await api.registerPlugin({
    // Plugin config. See "Plugin Configuration" section
  });

  // Plugin packages export a function that calls `api.registerPlugin` for you, so
  // for those you just pass `api` to the function.
  await registerFooPlugin(api);

  // Or you can register multiple at once, passing in either a function or a
  // registration object for each.
  await api.registerPlugins({
    foo: registerFooPlugin,
    another: {
      // some plugin config
    }
  });

  await api.start();
}

run().catch((error) => {
  Logger.error(error);
  process.exit(1);
});
```

Alternatively, you can keep your plugin list in a JSON file:

```js
import { importPluginsJSONFile, ReactionAPICore } from "@reactioncommerce/api-core";
import Logger from "@reactioncommerce/logger";
import authorizationPlugin from "@reactioncommerce/reaction-plugin-authorization";
import packageJson from "../package.json";

const api = new ReactionAPICore({
  // See "ReactionAPICore Configuration" section. Many options are also configured
  // by environment variables. See "Supported Environment Variables" section.
  serveStaticPaths: ["public"],
  version: packageJson.version
});

async function run() {
  // An optional function allows you to transform the list from the
  // JSON (add, swap, or remove plugins) before it attempts to load the
  // plugin modules.
  const plugins = await importPluginsJSONFile("./plugins.json", (pluginList) => {
    pluginList.authorization = authorizationPlugin;

    return pluginList;
  });

  await api.registerPlugins(plugins);

  await api.start();
}

run().catch((error) => {
  Logger.error(error);
  process.exit(1);
});
```

Sample `plugins.json` file:

```json
{
  "accounts": "./core-services/account/index.js",
  "address": "./core-services/address/index.js",
  "authentication": "@reactioncommerce/plugin-authentication",
  "authorization": "@reactioncommerce/plugin-simple-authorization"
}
```

All relative paths are assumed to be relative to the JSON file and are assumed to be an ES module. All packages are assumed to export the plugin registration function as their default ES module export.

### Included Features

Most Reaction API features are released as [plugins](#plugins), but even if you never register any plugins and run your API, you'll get the following core features automatically:

- A minimal GraphQL API running at `/graphql` on `ROOT_URL`, with a `ping` query, an `echo` mutation, and a `tick` subscription for testing.
- Commonly used core GraphQL types such as `Date`, `DateTime`, `Money`, and `Rate`, as well as types related to Relay-style pagination
- A static file server if you passed in the `serveStaticPaths` option
- A connection to MongoDB, with improved connection retry, if the `MONGO_URL` environment variable or the `mongoDb` option was provided
- Access to an Express app at `api.expressApp`

## Supported Environment Variables

The following environment variables are picked up automatically by the `ReactionAPICore` instance.

```js
{
  BODY_PARSER_SIZE_LIMIT: bodyParserValidator({
    default: 5 * 1000000 // value in bytes = 5mb
  }),
  GRAPHQL_INTROSPECTION_ENABLED: bool({ default: false, devDefault: true }),
  GRAPHQL_PLAYGROUND_ENABLED: bool({ default: false, devDefault: true }),
  MONGO_URL: str({
    devDefault: "mongodb://localhost:27017/reaction",
    desc: "A valid MongoDB connection string URI, ending with the database name",
    example: "mongodb://localhost:27017/reaction"
  }),
  PORT: num({
    default: 3000,
    desc: "The port on which the API server should listen",
    example: "8000"
  }),
  REACTION_LOG_LEVEL: str({
    choices: ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"],
    default: "WARN",
    devDefault: "DEBUG",
    desc: "Determines how much logging you see. The options, from least to most logging, are FATAL, ERROR, WARN, INFO, DEBUG, TRACE. See: https://github.com/trentm/node-bunyan#levels",
    example: "ERROR"
  }),
  REACTION_APOLLO_FEDERATION_ENABLED: bool({
    default: false,
    desc: "Set this to true if you need Apollo Federation support."
  }),
  REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED: bool({
    default: true,
    desc: "Set this to false if you do not need GraphQL subscription support"
  }),
  REACTION_SHOULD_INIT_REPLICA_SET: bool({
    default: false,
    devDefault: true,
    desc: "Automatically initialize a replica set for the MongoDB instance. Set this to 'true' when running the app for development or tests."
  }),
  ROOT_URL: str({
    devDefault: "http://localhost:3000",
    desc: "The protocol, domain, and port portion of the URL, to which relative paths will be appended. " +
      "This is used when full URLs are generated for things such as emails and notifications, so it must be publicly accessible.",
    example: "https://shop.mydomain.com"
  })
}
```

## ReactionAPICore Configuration

The following options can be passed in the first argument of `ReactionAPICore` when initializing an instance.

- **appEvents**: See the "Providing a Custom appEvents Implementation" section.
- **httpServer**: An HTTP server for GraphQL subscription websocket handlers. In most cases you should omit this and let `ReactionAPICore` create one for you.
- **mongodb**: Optionally pass in the `mongodb` reference from `import mongodb from "mongodb";`. In most cases you should omit this and let `ReactionAPICore` use its own reference, but if you need to ensure a specific version is used, this allows you to do that.
- **serveStaticPaths**: An optional array of paths (relative to your project root) that should be served as static files. Each of these is passed to [express.static()](https://expressjs.com/en/starter/static-files.html). If you need more control, you can access `api.expressApp` directly.
- **rootUrl**: Items such as `api.rootUrl`, `context.rootUrl`, and `context.getAbsoluteUrl` are set based on this. If not provided, falls back to `ROOT_URL` environment variable.
- **version**: Pass any valid version string. This is available to plugins as `api.version` or `context.appVersion`. This allows you to version your API as a whole (with all plugins installed and configured), which is different from the version of this `api-core` package. Use this for whatever purpose you want, but it is not required and will be `null` if you don't set a version.

## Plugins

The Reaction API server has a plugin system that allows code to be broken into small packages. Plugins can register functions, configuration, and GraphQL schemas and resolvers. The sum of everything registered by every plugin is your Reaction API.

In some cases a plugin has plugins of its own or has other external components that you also need to install.

A plugin need not be in a separate package. You can simply call `api.registerPlugin`, passing in any valid configuration. This may be fine for prototyping and quick tests, but we highly recommend that all plugins be published as separate NPM packages, which allows you to track and manage dependencies more easily. This does not necessarily mean they need to be published to NPM, but they must be something you can add to `package.json` and NPM will know how to install it. For example, a private GitHub repo will work.

If you publish a plugin as an NPM package, the default package export should be an async function that accepts `api` as the first argument and calls `api.registerPlugin` with all necessary configuration options.

### Plugin Configuration

Whether you are calling `api.registerPlugin` directly in an API project or within a plugin package, you must pass in an object that includes everything the plugin wants to make available to the core API or other API plugins. This `registerPlugin` object has a specific structure.

The two keys that every plugin will include are `name` and `label`. `name` must be unique, cannot contain spaces, and identifies your plugin; `label` is the human-readable version of your plugin name, for showing in UIs.

Beyond `name` and `label`, the following standard keys can be included in your `registerPlugin` object and are described in more detail below:

- `auth`
- `collections`
- `contextAdditions`
- `expressMiddleware`
- `functionsByType`
- `graphQL`
- `mutations`
- `queries`

#### auth

Plugins can pass functions in an `auth` object, which are then used to add permission and account information to `context` for each API request.

```js
auth: {
  accountByUserId,
  permissionsByUserId
}
```

- `accountByUserId`: An async function with signature `(context, userId)` that must return an account document for the given `userId`, or `null` if one cannot be found. This will be used to set `context.account` and `context.accountId`.
- `permissionsByUserId`: An async function with signature `(context, userId)` that must return an array of permissions for the given `userId`, or `null` if no permission list can be generated. This is available for each API request as `context.userPermissions`.

See also the "getHasPermissionFunctionForUser" functionsByType.

#### collections

To create any non-core MongoDB collection that a plugin needs, use the `collections` option:

```js
collections: {
  MyCustomCollection: {
    name: "MyCustomCollection"
  }
}
```

The `collections` object key is where you will access this collection on `context.collections`, and `name` is the collection name in MongoDB. We recommend you make these the same if you can.

The example above will make `context.collections.MyCustomCollection` available in all query and mutation functions, and all functions that receive `context`, such as startup functions. Note MongoDB may not actually create the collection until the first time you insert into it.

You can optionally add indexes for your MongoDB collection:

```js
collections: {
  MyCustomCollection: {
    name: "MyCustomCollection",
    indexes: [
      [{ referenceId: 1 }, { unique: true }]
    ]
  }
}
```

Each item in the `indexes` array is an array of arguments that will be passed to the Mongo `createIndex` function. The `background` option is always set to `true` so you need not include that.

There is also experimental support for defining validation options. Add `validator`, `validationLevel`, or `validationAction` options and they will be passed along to the MongoDB library. Refer to [their createCollection documentation](http://mongodb.github.io/node-mongodb-native/3.6/api/Db.html#createCollection).

There is also a convenience syntax that allows you to pass a JSONSchema directly. This:

```js
collections: {
  MyCustomCollection: {
    name: "MyCustomCollection",
    jsonSchema: someJsonSchema
  }
}
```

Is shorthand for this:

```js
collections: {
  MyCustomCollection: {
    name: "MyCustomCollection",
    validator: {
      $jsonSchema: someJsonSchema
    }
  }
}
```

NOTE: Registering your collections is not required, and in fact it is probably best to NOT register them unless you need to allow other plugins to access your data directly. As long as you do not register them, they remain a private implementation detail that you are free to change without breaking other plugins.

#### contextAdditions

A plugin can add properties to context using the `contextAdditions` option. They are added before any `preStartup` or `startup` functions are run.

```js
contextAdditions: {
  something: "wicked"
}
```

```js
// in startup fn or anywhere you have context
console.log(context.something); // "wicked"
```

#### expressMiddleware

Plugins can register Express middleware using the `expressMiddleware` option:

```js
expressMiddleware: [
  {
    route: "graphql",
    stage: "authenticate",
    fn: tokenMiddleware
  }
]
```

For now, only the "graphql" route is supported, and the following stages are supported in this order:

- `first`
- `before-authenticate`
- `authenticate`
- `before-response`

An `authenticate` middleware function should do something like look up the user by the Authorization header, and either set `request.user` or send a 401 response if the token is invalid. It should not require a token.

The `first` middleware stage can be used for loggers or anything else that needs to be first in the middleware list. `before-response` middleware will have the user available if there is one, and is called before the Apollo GraphQL middleware.

A middleware function is passed `context` and must return the Express middleware handler function, which must call `next()` or send a response.

#### functionsByType

The `functionsByType` object is a map of function types to arrays of functions of that type. This pattern can be used by any plugin to allow any other plugin to register certain types of functions for plugin points.

Documentation for individual plugins will tell you how to use this for that plugin, but there are also a few core types that any plugin might want to use:

- createDataLoaders
- getHasPermissionFunctionForUser
- preStartup
- registerPluginHandler
- startup
- shutdown

Look at built-in plugins for examples of these, and read [How To: Share Code Between API Plugins](https://docs.reactioncommerce.com/docs/how-to-share-code-between-plugins) for more information.

#### graphQL

Use the `graphQL` object to register schemas and resolvers that extend the core GraphQL API.

More information:

- [How To: Create a new GraphQL mutation](https://docs.reactioncommerce.com/docs/graphql-create-mutation)
- [How To: Create a new GraphQL query](https://docs.reactioncommerce.com/docs/graphql-create-query)
- [How To: Extend GraphQL to add a field](https://docs.reactioncommerce.com/docs/how-to-extend-graphql-to-add-field)
- [How To: Extend GraphQL with Remote Schema Delegation](https://docs.reactioncommerce.com/docs/how-to-extend-graphql-with-remote-schema)

#### mutations and queries

The `mutations` and `queries` objects are maps of functions that are extended onto `context.mutations` and `context.queries`. These may be functions that are called from GraphQL resolvers of a similar name, or functions that are intended to be called only by other plugin code. Functions that modify data should be registered as `mutations` and all other functions should be registered as `queries`.

## App Context

Apollo Server passes a `context` object to every GraphQL resolver. By convention, plugins pass this down as the first argument to all internal query, mutation, and util functions, too. We refer to this as the app context, and many different things live on it. It is the primary way that functions and other information are shared among plugins.

There are two types of properties on the app context: instance properties and request properties. Most properties are instance properties; they are set when you initialize a `ReactionAPICore` instance or when you register a plugin, and they do not change while the API is running. A few other properties are added to the context at the start of every request that comes in, and these are the request properties.

Instance properties:

- `app`: The `ReactionAPICore` instance that owns this context. (Note that `api.context.app` is a circular reference.)
- `appEvents`: A simple event mechanism with `on` and `emit` properties. This allows event-based communication among plugins. Unlike Node's built-in `EventEmitter`, `appEvents.on` functions may return Promises and `appEvents.emit` may be awaited in situations where you want to be sure all event listeners have handled the event before continuing.
- `appVersion`: A string set to whatever the `version` option is when creating the `ReactionAPICore` instance
- `collections`: An object with references to [MongoDB collections](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html), built by any plugins that register collections. Allows direct access to collections from various plugins even if only one plugin "owns" that collection.
- `getInternalContext`: A function that takes no arguments and returns a context with all authentication and authorization mocked to allow anything. Useful when you need to pass down context to another query or mutation but circumvent its normal authorization checks.
- `getFunctionsOfType`: A function that takes one argument, a type string, and returns an array of all functions that were registered with that type. This is a simple way that plugins can share functions with other plugins for specific purposes
- `mutations` and `queries`: These objects have references to all functions that plugins have registered in their own `mutations` and `queries` objects, when calling `registerPlugin`. If multiple plugins have mutations or queries with the same name, the last plugin to be registered will win (unlike `getFunctionsOfType` where multiple functions may be registered).
- `rootUrl`: The root URL string, from `rootUrl` instance option or `ROOT_URL` environment variable
- `getAbsoluteUrl`: A function that is bound to `rootUrl`, for easy conversion of a relative URL to one that is absolute and begins with `rootUrl`.

There may be additional instance properties if any plugins have added them using the `contextAdditions` option for `registerPlugin`. Refer to documentation for individual plugins.

Request properties:

- `user`: The User document for the user who made the request. This is set to the Express `request.user` property, which any plugin can set by registering request middleware.
- `userId`: If `user` is set, this will be the `user._id`, for convenience.
- `account`: If `context.auth.accountByUserId` is a function and `context.user` is set, `accountByUserId` will be called for the request, and the return value will be available as `context.account`. The `user` is a generic authentication document for OAuth, whereas `account` is a Reaction-specific concept where additional information about each user is tracked.
- `accountId`: If `account` is set, this will be the `account._id`, for convenience.
- `userPermissions`: If `context.auth.permissionsByUserId` is a function, it will be called with `(context, userId)` arguments, and the return value is available as `context.userPermissions`.
- `userHasPermission`: A function that you can call to determine whether a user has needed permissions. It calls any functions registered as type `getHasPermissionFunctionForUser`, passing in `context`, and then calls the function returned by each. Returns `true` only if every registered function returns `true`.
- `validatePermissions`: Calls `userHasPermission` and throws an Access Denied error if it returns `false`.
- `requestHeaders`: An object with all HTTP headers for the current request on it, except with `Authorization` and `Cookie` headers removed for security.

You can always access the app context on `api.context` if you have a reference to the `api` instance, but this will never have any request properties set because there is no request happening.

## Providing a Custom appEvents Implementation

`context.appEvents` is available to all plugins and is used for communication among plugins. The built-in implementation of this is not highly optimized, but you may provide your own implementation to meet your needs.

To override the built-in `appEvents` with your own, pass `appEvents` option when constructing your API instance. The provided object must have 4 function properties named `emit`, `on`, `stop`, and `resume`. Here's an example:

```js
const appEvents = {
  async emit(name, ...args) {},
  on(name, func) {},
  stop() {},
  resume() {}
};

const api = new ReactionAPICore({ appEvents });
```

- `stop` should stop emission and `resume` should resume emission. Neither takes any arguments.
- `emit`:
  - `emit` may or may not return a Promise, but either way the final returned value must be `undefined`
  - When emission is stopped, `emit` should do nothing
  - When emission is not stopped, `emit` should call each handler registered by `on` one by one. If a handler returns a Promise, wait until it resolves or rejects before calling the next handler. `emit` itself should not resolve or reject until all handlers have been called and have resolved or rejected.
  - Any additional `args` passed to `emit` should be passed along to each handler function.
- `on` registers a handler function to be called by `emit`.
- Handlers are called only after they are registered. Any events emitted prior to registering a handler are never handled by that handler.

## Writing Tests Using ReactionTestAPICore

Refer to [Writing Jest Integration Tests](https://docs.reactioncommerce.com/docs/writing-jest-integration-tests).

## Developer Certificate of Origin
We use the [Developer Certificate of Origin (DCO)](https://developercertificate.org/) in lieu of a Contributor License Agreement for all contributions to Reaction Commerce open source projects. We request that contributors agree to the terms of the DCO and indicate that agreement by signing-off all commits made to Reaction Commerce projects by adding a line with your name and email address to every Git commit message contributed:

```
Signed-off-by: Jane Doe <jane.doe@example.com>
```

You can sign-off your commit automatically with Git by using `git commit -s` if you have your `user.name` and `user.email` set as part of your Git configuration.

We ask that you use your real full name (please no anonymous contributions or pseudonyms) and a real email address. By signing-off your commit you are certifying that you have the right to submit it under the [GNU GPLv3 License](./LICENSE.md).

We use the [Probot DCO GitHub app](https://github.com/apps/dco) to check for DCO sign-offs of every commit.

If you forget to sign-off your commits, the DCO bot will remind you and give you detailed instructions for how to amend your commits to add a signature.

## License
This Reaction package is [GNU GPLv3 Licensed](./LICENSE.md)

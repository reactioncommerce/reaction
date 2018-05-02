# Integration Tests

This folder contains test files that run GraphQL integration tests. (Other types of integration tests can be put here, too, but currently it is only for GraphQL server tests.)

## Purpose

GraphQL integration tests are useful for testing things like

- queries involving multiple resolvers
- response pagination
- whether mutations properly affect the MongoDB collections
- the effect of complex permission rules on query results

## Running the Tests

```bash
npm run test:integration
```

Or in watch mode:

```bash
npm run test:integration:watch
```

## Writing GraphQL Tests

The folder and file structure in here should match as much as possible the graphql plugin folder structure.

Jest is used to run the tests. Create or modify a `.test.js` file, and add Jest tests.

Writing integration tests isn't much different from writing unit tests, except that you will have to initialize a server, in-memory database, and any collection data you need prior to running the tests. Then stop the server when done. The general pattern is something like this:

```js
import GraphTester from "../GraphTester";

let tester;
beforeAll(async () => {
  tester = new GraphTester();
  await tester.startServer();
});

afterAll(() => tester.stopServer());

test("something", async () => {
  // (1) use tester.collections to write to MongoDB collections to set up initial data state
  // (2) execute a GraphQL query or mutation using tester.query()() or tester.mutation()()
  // (3) verify the response is as expected and/or verify that the collection data has been changed
  // (4) optionally reset the database if there is a chance it will conflict with the next test in this file
});
```

### Further Reading

- The MongoDB collections are simulated in-memory collections, implemented using [NeDB](https://github.com/louischatriot/nedb).
- The `query`, `mutation`, and `subscription` properties of the `GraphTester` instance are wrappers around the methods of the same name provided by the [graphql.js](https://github.com/f/graphql.js) package.

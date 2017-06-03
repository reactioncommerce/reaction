jest.mock("/lib/collections", () => {
  return {
    Packages: {},
    Shops: {}
  };
});

import Router from "../router.js";


/**
 * Order Summary is a display only component
 * It receives props and displays them accordingly
 */

beforeEach(() => {
  // Set some default routes
  Router.setCurrentRoute({});
  Router.routes = [
    {
      fullPath: "/test?filter=red",
      query: {
        filter: "red"
      },
      route: {
        name: "test",
        path: "/test",
        route: "/test"
      }
    },
    {
      params: {
        id: "a12345"
      },
      query: {
        filter: "green"
      },
      route: {
        fullPath: "/reaction/test/1234?filter=green",
        group: {
          prefix: "/reaction"
        },
        name: "singleTestItem",
        path: "/reaction/test/12345",
        route: "/reaction/test/:id"
      }
    }
  ];
});

afterEach(() => {
  jest.clearAllMocks();
});


test("Route name to equal test", () => {
  // TODO: Update test when server router is implemented to use Router.go()
  Router.setCurrentRoute(Router.routes[0]);

  expect(Router.getRouteName()).toBe("test");
});

test("Route query param 'filter' to equal 'red'", () => {
  // TODO: Update test when server router is implemented to use Router.go()
  Router.setCurrentRoute(Router.routes[0]);

  const queryValue = Router.getQueryParam("filter");

  expect(queryValue).toBe("red");
});

test("Route /test/:id param 'id' to equal '12345'", () => {
  // TODO: Update test when server router is implemented to use Router.go()
  Router.setCurrentRoute(Router.routes[1]);

  const received = Router.getParam("id");

  expect(received).toBe("a12345");
});

test("Route is active with name 'singleTestItem'", () => {
  // TODO: Update test when server router is implemented to use Router.go()
  Router.setCurrentRoute(Router.routes[1]);

  const received = Router.isActiveClassName("singleTestItem");

  expect(received).toBe("active");
});

test("Route /test/:id is active with prefixed path '/reaction/test/12345'", () => {
  // TODO: Update test when server router is implemented to use Router.go()
  Router.setCurrentRoute(Router.routes[1]);

  const received = Router.isActiveClassName("/reaction/test/12345");

  expect(received).toBe("active");
});

test("Route /test is active with un-prefixed path '/test'", () => {
  // TODO: Update test when server router is implemented to use Router.go()
  Router.setCurrentRoute(Router.routes[0]);

  const received = Router.isActiveClassName("/test");

  expect(received).toBe("active");
});

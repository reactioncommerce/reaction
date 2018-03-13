import Hooks from "../hooks.js";

describe("Hooks", () => {
  let callback;

  beforeEach(() => {
    callback = jest.fn();
  });

  afterEach(() => {
    // super gross reset
    Hooks._hooks = {
      onEnter: {},
      onExit: {}
    };
  });

  ["onEnter", "onExit"].forEach((hook) => {
    describe(hook, () => {
      test("callback is added to the Global set of hooks", () => {
        Hooks[hook](callback);

        Hooks.run(hook, "GLOBAL");

        expect(callback).toHaveBeenCalled();
      });

      test("callback is added to the route-specific set of hooks", () => {
        const route = "/reaction";

        Hooks[hook](route, callback);
        Hooks.run(hook, route);

        expect(callback).toHaveBeenCalled();
      })
    });
  });
});

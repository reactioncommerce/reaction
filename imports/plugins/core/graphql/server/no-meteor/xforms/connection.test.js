import { xformArrayToConnection } from "./connection";

describe("xformArrayToConnection", () => {
  test("returns an async function that transforms an array to a connection", async () => {
    const inputArray = [
      { _id: "123", name: "foo" },
      { _id: "321", name: "far" }
    ];

    const result = await xformArrayToConnection({}, inputArray);

    expect(result).toEqual({
      edges: [
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjA=",
          node: {
            _id: "123",
            name: "foo"
          }
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE=",
          node: {
            _id: "321",
            name: "far"
          }
        }
      ],
      nodes: inputArray,
      pageInfo: {
        endCursor: "YXJyYXljb25uZWN0aW9uOjE=",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "YXJyYXljb25uZWN0aW9uOjA="
      },
      totalCount: 2
    });
  });

  test("works on a promise that returns an array", async () => {
    const inputArray = [
      { _id: "123", name: "foo" },
      { _id: "321", name: "far" }
    ];

    const result = await xformArrayToConnection({}, Promise.resolve(inputArray));

    expect(result).toEqual({
      edges: [
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjA=",
          node: {
            _id: "123",
            name: "foo"
          }
        },
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE=",
          node: {
            _id: "321",
            name: "far"
          }
        }
      ],
      nodes: inputArray,
      pageInfo: {
        endCursor: "YXJyYXljb25uZWN0aW9uOjE=",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "YXJyYXljb25uZWN0aW9uOjA="
      },
      totalCount: 2
    });
  });

  test("slices the array for forward pagination", async () => {
    const inputArray = [
      { _id: "123", name: "foo" },
      { _id: "321", name: "far" }
    ];

    const result = await xformArrayToConnection({
      first: 1,
      after: "YXJyYXljb25uZWN0aW9uOjA="
    }, Promise.resolve(inputArray));

    expect(result).toEqual({
      edges: [
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjE=",
          node: {
            _id: "321",
            name: "far"
          }
        }
      ],
      nodes: [inputArray[1]],
      pageInfo: {
        endCursor: "YXJyYXljb25uZWN0aW9uOjE=",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "YXJyYXljb25uZWN0aW9uOjE="
      },
      totalCount: 2
    });
  });

  test("slices the array for backward pagination", async () => {
    const inputArray = [
      { _id: "123", name: "foo" },
      { _id: "321", name: "far" }
    ];

    const result = await xformArrayToConnection({
      last: 1,
      before: "YXJyYXljb25uZWN0aW9uOjE="
    }, Promise.resolve(inputArray));

    expect(result).toEqual({
      edges: [
        {
          cursor: "YXJyYXljb25uZWN0aW9uOjA=",
          node: {
            _id: "123",
            name: "foo"
          }
        }
      ],
      nodes: [inputArray[0]],
      pageInfo: {
        endCursor: "YXJyYXljb25uZWN0aW9uOjA=",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "YXJyYXljb25uZWN0aW9uOjA="
      },
      totalCount: 2
    });
  });
});

import applyBeforeAfterToFilter from "./applyBeforeAfterToFilter.js";

test("throws an error if sortBy is missing", () =>
  expect(() => applyBeforeAfterToFilter({ sortBy: null })).toThrowErrorMatchingSnapshot());

test("throws an error if sortOrder is missing", () =>
  expect(() => applyBeforeAfterToFilter({ sortOrder: null })).toThrowErrorMatchingSnapshot());

test("throws an error if both before and after are set", () =>
  expect(() => applyBeforeAfterToFilter({ after: { _id: "123" }, before: { _id: "123" } })).toThrowErrorMatchingSnapshot());

describe("after", () => {
  test("alters filter correctly when sorting by _id ascending (default)", () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const result = applyBeforeAfterToFilter({ after: { _id: "123" }, baseFilter });

    expect(result).toEqual({
      $and: [
        baseFilter,
        { _id: { $gt: "123" } }
      ]
    });
  });

  test("alters filter correctly when sorting by _id descending", () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const result = applyBeforeAfterToFilter({ after: { _id: "123" }, baseFilter, sortOrder: "desc" });

    expect(result).toEqual({
      $and: [
        baseFilter,
        { _id: { $lt: "123" } }
      ]
    });
  });

  test("alters filter correctly when sorting by a non-_id field ascending", () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const name = "Some Name";
    const result = applyBeforeAfterToFilter({
      after: { _id: "123", name },
      baseFilter,
      sortBy: "name"
    });

    expect(result).toEqual({
      $and: [
        baseFilter,
        {
          $or: [
            { name: { $gt: name } },
            { _id: { $gt: "123" }, name }
          ]
        }
      ]
    });
  });

  test("alters filter correctly when sorting by a non-_id field descending", () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const name = "Some Name";
    const result = applyBeforeAfterToFilter({
      after: { _id: "123", name },
      baseFilter,
      sortBy: "name",
      sortOrder: "desc"
    });

    expect(result).toEqual({
      $and: [
        baseFilter,
        {
          $or: [
            { name: { $lt: name } },
            { _id: { $lt: "123" }, name }
          ]
        }
      ]
    });
  });
});

describe("before", () => {
  test("alters filter correctly when sorting by _id ascending (default)", () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const result = applyBeforeAfterToFilter({ before: { _id: "123" }, baseFilter });

    expect(result).toEqual({
      $and: [
        baseFilter,
        { _id: { $lt: "123" } }
      ]
    });
  });

  test("alters filter correctly when sorting by _id descending", () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const result = applyBeforeAfterToFilter({ before: { _id: "123" }, baseFilter, sortOrder: "desc" });

    expect(result).toEqual({
      $and: [
        baseFilter,
        { _id: { $gt: "123" } }
      ]
    });
  });

  test("alters filter correctly when sorting by a non-_id field ascending", () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const name = "Some Name";
    const result = applyBeforeAfterToFilter({
      before: { _id: "123", name },
      baseFilter,
      sortBy: "name"
    });

    expect(result).toEqual({
      $and: [
        baseFilter,
        {
          $or: [
            { name: { $lt: name } },
            { _id: { $lt: "123" }, name }
          ]
        }
      ]
    });
  });

  test("alters filter correctly when sorting by a non-_id field descending", () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const name = "Some Name";
    const result = applyBeforeAfterToFilter({
      before: { _id: "123", name },
      baseFilter,
      sortBy: "name",
      sortOrder: "desc"
    });

    expect(result).toEqual({
      $and: [
        baseFilter,
        {
          $or: [
            { name: { $gt: name } },
            { _id: { $gt: "123" }, name }
          ]
        }
      ]
    });
  });
});

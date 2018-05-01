import applyBeforeAfterToFilter from "./applyBeforeAfterToFilter";

test("throws an error if sortBy is missing", () =>
  expect(applyBeforeAfterToFilter({ sortBy: null })).rejects.toMatchSnapshot());

test("throws an error if sortOrder is missing", () =>
  expect(applyBeforeAfterToFilter({ sortOrder: null })).rejects.toMatchSnapshot());

test("throws an error if both before and after are set", () =>
  expect(applyBeforeAfterToFilter({ after: "123", before: "123" })).rejects.toMatchSnapshot());

describe("after", () => {
  test("alters filter correctly when sorting by _id ascending (default)", async () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const result = await applyBeforeAfterToFilter({ after: "123", baseFilter });

    expect(result).toEqual({
      $and: [
        baseFilter,
        { _id: { $gt: "123" } }
      ]
    });
  });

  test("alters filter correctly when sorting by _id descending", async () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const result = await applyBeforeAfterToFilter({ after: "123", baseFilter, sortOrder: "desc" });

    expect(result).toEqual({
      $and: [
        baseFilter,
        { _id: { $lt: "123" } }
      ]
    });
  });

  test("alters filter correctly when sorting by a non-_id field ascending", async () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const name = "Some Name";
    const result = await applyBeforeAfterToFilter({
      after: "123",
      baseFilter,
      collection: {
        findOne: () => ({ name })
      },
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

  test("alters filter correctly when sorting by a non-_id field descending", async () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const name = "Some Name";
    const result = await applyBeforeAfterToFilter({
      after: "123",
      baseFilter,
      collection: {
        findOne: () => ({ name })
      },
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
  test("alters filter correctly when sorting by _id ascending (default)", async () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const result = await applyBeforeAfterToFilter({ before: "123", baseFilter });

    expect(result).toEqual({
      $and: [
        baseFilter,
        { _id: { $lt: "123" } }
      ]
    });
  });

  test("alters filter correctly when sorting by _id descending", async () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const result = await applyBeforeAfterToFilter({ before: "123", baseFilter, sortOrder: "desc" });

    expect(result).toEqual({
      $and: [
        baseFilter,
        { _id: { $gt: "123" } }
      ]
    });
  });

  test("alters filter correctly when sorting by a non-_id field ascending", async () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const name = "Some Name";
    const result = await applyBeforeAfterToFilter({
      before: "123",
      baseFilter,
      collection: {
        findOne: () => ({ name })
      },
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

  test("alters filter correctly when sorting by a non-_id field descending", async () => {
    const baseFilter = { _id: { $in: ["abc"] } };
    const name = "Some Name";
    const result = await applyBeforeAfterToFilter({
      before: "123",
      baseFilter,
      collection: {
        findOne: () => ({ name })
      },
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

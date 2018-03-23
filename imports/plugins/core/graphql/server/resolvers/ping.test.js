import pingImport from "./ping";

const { ping } = pingImport.Query;
const { echo } = pingImport.Mutation;

test("ping query returns pong", () => {
  expect(ping()).toBe("pong");
});

test("echo mutation returns str param", () => {
  expect(echo(null, { str: "prestidigitation" })).toBe("prestidigitation");
});

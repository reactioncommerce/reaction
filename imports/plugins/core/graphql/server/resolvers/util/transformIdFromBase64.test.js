import transformIdFromBase64 from "./transformIdFromBase64";

test("takes base64 ID and returns namespace and ID", () => {
  const result = transformIdFromBase64("QWNjb3VudDoxMjM=");
  expect(result).toEqual({ namespace: "Account", id: "123" });
});

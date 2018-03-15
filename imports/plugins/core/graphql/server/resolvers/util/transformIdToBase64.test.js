import transformIdToBase64 from "./transformIdToBase64";

test("takes namespace and ID and returns base64", () => {
  const result = transformIdToBase64("Account", "123");
  expect(result).toBe("QWNjb3VudDoxMjM=");
});

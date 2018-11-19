import mockContext from "/imports/test-utils/helpers/mockContext";
import { NavigationItem as NavigationItemSchema } from "/imports/collections/schemas";
import createNavigationItemMutation from "./createNavigationItem";

test("calls NavigationItems.insert and returns an object that validates against the schema", async () => {
  const navigationItem = await createNavigationItemMutation(mockContext, {});
  const validationContext = NavigationItemSchema.newContext();
  validationContext.validate(navigationItem)
  const isValid = validationContext.isValid();
  expect(isValid).toBe(true);
  expect(mockContext.collections.NavigationItems.insertOne).toHaveBeenCalled();
});

test("throws an error if the user does not have the core permission", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  const result = createNavigationItemMutation(mockContext, {});
  expect(result).rejects.toThrow();
});

test("throws an error if invalid JSON metadata is passed", async () => {
  const result = createNavigationItemMutation(mockContext, { metadata: "INVALID_JSON" });
  expect(result).rejects.toThrow();
});

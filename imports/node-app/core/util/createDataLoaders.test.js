import DataLoader from "dataloader";
import createDataLoaders, { } from "./createDataLoaders";

const usersDataLoaderFactory = (context, createDataloader) => ({
  Users: createDataloader(() => { /* dataloader implementation here */ })
});

const shopsDataLoaderFactory = (context, createDataloader) => ({
  Shops: createDataloader(() => { /* dataloader implementation here */ })
});

const ctx = {
  getFunctionsOfType() {
    return [
      usersDataLoaderFactory,
      shopsDataLoaderFactory
    ];
  },
  dataloaders: {}
};

test("populates dataloaders correctly using factory functions in context", async () => {
  await createDataLoaders(ctx);
  expect(ctx.dataLoaders.Users).toBeInstanceOf(DataLoader);
  expect(ctx.dataLoaders.Shops).toBeInstanceOf(DataLoader);
});

test("always creates new dataloaders map", async () => {
  await createDataLoaders(ctx);
  const { dataLoaders } = ctx;
  await createDataLoaders(ctx);
  expect(ctx.dataLoaders).not.toBe(dataLoaders);
});

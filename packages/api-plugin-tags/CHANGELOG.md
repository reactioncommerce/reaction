# @reactioncommerce/api-plugin-tags

## 2.0.0

### Major Changes

- [#6740](https://github.com/reactioncommerce/reaction/pull/6740) [`fee4dbe95`](https://github.com/reactioncommerce/reaction/commit/fee4dbe952e557db8ca658dc08283ba6c7343af9) Thanks [@sujithvn](https://github.com/sujithvn)! - Node18 upgrade includes assert json

### Minor Changes

- [#6744](https://github.com/reactioncommerce/reaction/pull/6744) [`a50a7b359`](https://github.com/reactioncommerce/reaction/commit/a50a7b359bbb546b7abab0e0bfed4c5d8b5ad759) Thanks [@sujithvn](https://github.com/sujithvn)! - checks for encodedId before calling decode. Normal-id pass through

### Patch Changes

- Updated dependencies [[`a6172e9a9`](https://github.com/reactioncommerce/reaction/commit/a6172e9a9b0012c2224796fc079ff135920ef33b), [`a50a7b359`](https://github.com/reactioncommerce/reaction/commit/a50a7b359bbb546b7abab0e0bfed4c5d8b5ad759), [`315bb97ab`](https://github.com/reactioncommerce/reaction/commit/315bb97abc3e70dcb1a89da8adca5468302b24be), [`fee4dbe95`](https://github.com/reactioncommerce/reaction/commit/fee4dbe952e557db8ca658dc08283ba6c7343af9)]:
  - @reactioncommerce/file-collections@0.10.0
  - @reactioncommerce/api-utils@2.0.0

## 1.2.1

### Patch Changes

- [#6695](https://github.com/reactioncommerce/reaction/pull/6695) [`1dd0c0468`](https://github.com/reactioncommerce/reaction/commit/1dd0c04687e473489e7225dda8b2b880df1b94b2) Thanks [@zenweasel](https://github.com/zenweasel)! - Allow getSlug to take a second parameter of allowedChars

- Updated dependencies [[`8392ba163`](https://github.com/reactioncommerce/reaction/commit/8392ba163a402ba0528f5658bd2f206cb9433eee), [`1dd0c0468`](https://github.com/reactioncommerce/reaction/commit/1dd0c04687e473489e7225dda8b2b880df1b94b2)]:
  - @reactioncommerce/api-utils@1.17.1

## 1.2.0

### Minor Changes

- [#6541](https://github.com/reactioncommerce/reaction/pull/6541) [`6f0143d31`](https://github.com/reactioncommerce/reaction/commit/6f0143d31b8c1a869b70084c904e491ed35e4807) Thanks [@vishalmalu](https://github.com/vishalmalu)! - Added afterAddTagsToProducts, afterTagDelete, afterRemoveTagsFromProducts events when respective mutations are called.

- [#6550](https://github.com/reactioncommerce/reaction/pull/6550) [`332e88b4b`](https://github.com/reactioncommerce/reaction/commit/332e88b4b369b355d6bda891b6493ed1e2d7ea74) Thanks [@zenweasel](https://github.com/zenweasel)! - Added ability to filter by createdAt/updatedAt on products and tags query

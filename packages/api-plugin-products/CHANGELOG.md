# @reactioncommerce/api-plugin-products

## 2.0.0

### Major Changes

- [#6740](https://github.com/reactioncommerce/reaction/pull/6740) [`fee4dbe95`](https://github.com/reactioncommerce/reaction/commit/fee4dbe952e557db8ca658dc08283ba6c7343af9) Thanks [@sujithvn](https://github.com/sujithvn)! - Node18 upgrade includes assert json

### Minor Changes

- [#6840](https://github.com/reactioncommerce/reaction/pull/6840) [`a90dc012d`](https://github.com/reactioncommerce/reaction/commit/a90dc012dd10bccf9a0b275fbd140e0abd82d7c1) Thanks [@sujithvn](https://github.com/sujithvn)! - Fulfillment Type feature

- [#6744](https://github.com/reactioncommerce/reaction/pull/6744) [`a50a7b359`](https://github.com/reactioncommerce/reaction/commit/a50a7b359bbb546b7abab0e0bfed4c5d8b5ad759) Thanks [@sujithvn](https://github.com/sujithvn)! - checks for encodedId before calling decode. Normal-id pass through

- [#6684](https://github.com/reactioncommerce/reaction/pull/6684) [`315bb97ab`](https://github.com/reactioncommerce/reaction/commit/315bb97abc3e70dcb1a89da8adca5468302b24be) Thanks [@sujithvn](https://github.com/sujithvn)! - Filter feature. This new feature provides a common function that can be used in a new query endpoint to get filtered results from any collection.

### Patch Changes

- Updated dependencies [[`a50a7b359`](https://github.com/reactioncommerce/reaction/commit/a50a7b359bbb546b7abab0e0bfed4c5d8b5ad759), [`315bb97ab`](https://github.com/reactioncommerce/reaction/commit/315bb97abc3e70dcb1a89da8adca5468302b24be), [`fee4dbe95`](https://github.com/reactioncommerce/reaction/commit/fee4dbe952e557db8ca658dc08283ba6c7343af9)]:
  - @reactioncommerce/api-utils@2.0.0

## 1.3.1

### Patch Changes

- [#6565](https://github.com/reactioncommerce/reaction/pull/6565) [`b48825c43`](https://github.com/reactioncommerce/reaction/commit/b48825c43f1d72347e2173cf09c1a363638ae173) Thanks [@smriti0710](https://github.com/smriti0710)! - awaited the recursive createHandle call

## 1.3.0

### Minor Changes

- [#6551](https://github.com/reactioncommerce/reaction/pull/6551) [`72b77f6ef`](https://github.com/reactioncommerce/reaction/commit/72b77f6ef4baf84dd437f86fe7f81b3f9ac2647a) Thanks [@vishalmalu](https://github.com/vishalmalu)! - Added shopId to payload for afterAddTagsToProducts & afterRemoveTagsFromProducts events

## 1.2.0

### Minor Changes

- [#6541](https://github.com/reactioncommerce/reaction/pull/6541) [`6f0143d31`](https://github.com/reactioncommerce/reaction/commit/6f0143d31b8c1a869b70084c904e491ed35e4807) Thanks [@vishalmalu](https://github.com/vishalmalu)! - Added afterAddTagsToProducts, afterTagDelete, afterRemoveTagsFromProducts events when respective mutations are called.

- [#6550](https://github.com/reactioncommerce/reaction/pull/6550) [`332e88b4b`](https://github.com/reactioncommerce/reaction/commit/332e88b4b369b355d6bda891b6493ed1e2d7ea74) Thanks [@zenweasel](https://github.com/zenweasel)! - Added ability to filter by createdAt/updatedAt on products and tags query

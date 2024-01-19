# @reactioncommerce/api-plugin-orders

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

## 1.4.5

### Patch Changes

- [#6536](https://github.com/reactioncommerce/reaction/pull/6536) [`40d172db1`](https://github.com/reactioncommerce/reaction/commit/40d172db19b9e662a7d8b2018709a17384d2a3d2) Thanks [@tedraykov](https://github.com/tedraykov)! - Fix(orders): await order items before passing them to additional transformation function xformOrderItems

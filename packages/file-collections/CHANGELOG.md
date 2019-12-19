# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.3](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.7.2...@reactioncommerce/file-collections@0.7.3) (2019-12-19)


### Bug Fixes

* pass absolute URL to tus client ([98566c2](https://github.com/reactioncommerce/reaction-file-collections/commit/98566c217f4f0bdd0a5536c0cc9a82dcbc22c787)), closes [#34](https://github.com/reactioncommerce/reaction-file-collections/issues/34)





## [0.7.2](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.7.1...@reactioncommerce/file-collections@0.7.2) (2019-12-17)


### Bug Fixes

* convert Blobs to streams only in a Node env ([f8a01d6](https://github.com/reactioncommerce/reaction-file-collections/commit/f8a01d644d606b26fee6bc9574151195ff345a3f))





## [0.7.1](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.7.0...@reactioncommerce/file-collections@0.7.1) (2019-12-17)


### Bug Fixes

* use newer lastModified prop in fromFile fn ([c2e92bb](https://github.com/reactioncommerce/reaction-file-collections/commit/c2e92bbde86ea43d86947afc0638ec595334ac05))





# [0.7.0](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.6.1...@reactioncommerce/file-collections@0.7.0) (2019-08-23)

**Note:** Version bump only for package @reactioncommerce/file-collections





## [0.6.1](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.6.0...@reactioncommerce/file-collections@0.6.1) (2019-06-27)


### Bug Fixes

* update packages to resolve security issues ([9d572c0](https://github.com/reactioncommerce/reaction-file-collections/commit/9d572c0))





<a name="0.6.0"></a>
## [0.6.0](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.5.0...@reactioncommerce/file-collections@0.6.0) (2018-08-30)


### Bug Fixes

* update tus-node-server to 0.3.1 ([77607ff](https://github.com/reactioncommerce/reaction-file-collections/commit/77607ff))
* **file-collection:** update and pin tus deps ([5fac24a](https://github.com/reactioncommerce/reaction-file-collections/commit/5fac24a))
* update tus-node-server to 0.3.0 ([7484839](https://github.com/reactioncommerce/reaction-file-collections/commit/7484839))



<a name="0.5.0"></a>
# 0.5.0 (2018-04-26)


### Bug Fixes

* download handler now works correctly when filename contains a `+` ([4db1bf3](https://github.com/reactioncommerce/reaction-file-collections/commit/4db1bf3)), closes [#6](https://github.com/reactioncommerce/reaction-file-collections/issues/6)


### Features

* add MongoFileCollection class ([299d635](https://github.com/reactioncommerce/reaction-file-collections/commit/299d635))




<a name="0.4.5"></a>
## [0.4.5](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.4.4...@reactioncommerce/file-collections@0.4.5) (2018-03-06)


### Bug Fixes

* **FileRecord:** fullClone does store write correctly now ([ea1eb5a](https://github.com/reactioncommerce/reaction-file-collections/commit/ea1eb5a))
* **MeteorFileCollection:** Return inserted doc from _insert in Node ([ac6644a](https://github.com/reactioncommerce/reaction-file-collections/commit/ac6644a))




<a name="0.4.4"></a>
## [0.4.4](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.4.3...@reactioncommerce/file-collections@0.4.4) (2018-03-06)


### Bug Fixes

* **MeteorFileCollection:** Support selectors in findOne for server/node ([c5482aa](https://github.com/reactioncommerce/reaction-file-collections/commit/c5482aa))
* findOne doesn't need selector switch ([ca40ca7](https://github.com/reactioncommerce/reaction-file-collections/commit/ca40ca7))




<a name="0.4.3"></a>
## [0.4.3](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.4.2...@reactioncommerce/file-collections@0.4.3) (2018-02-23)


### Bug Fixes

* Don't swallow errors thrown in some functions ([4413556](https://github.com/reactioncommerce/reaction-file-collections/commit/4413556))




<a name="0.4.2"></a>
## [0.4.2](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.4.1...@reactioncommerce/file-collections@0.4.2) (2018-02-23)


### Bug Fixes

* **MeteorFileCollection:** Support selectors in findOne/findOneLocal ([74c6444](https://github.com/reactioncommerce/reaction-file-collections/commit/74c6444))




<a name="0.4.1"></a>
## [0.4.1](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.4.0...@reactioncommerce/file-collections@0.4.1) (2018-02-23)


### Bug Fixes

* Rename clone method to fullClone ([0825a92](https://github.com/reactioncommerce/reaction-file-collections/commit/0825a92))




<a name="0.4.0"></a>
# [0.4.0](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.3.0...@reactioncommerce/file-collections@0.4.0) (2018-02-23)


### Features

* Security for MeteorFileCollection over DDP ([5f27595](https://github.com/reactioncommerce/reaction-file-collections/commit/5f27595))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.2.0...@reactioncommerce/file-collections@0.3.0) (2018-02-22)


### Features

* **FileRecord:** Add clone method ([713b129](https://github.com/reactioncommerce/reaction-file-collections/commit/713b129))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.1.1...@reactioncommerce/file-collections@0.2.0) (2018-02-22)


### Features

* **workers:** Split FileWorker into two different classes ([4c96fba](https://github.com/reactioncommerce/reaction-file-collections/commit/4c96fba))




<a name="0.1.1"></a>
## [0.1.1](https://github.com/reactioncommerce/reaction-file-collections/compare/@reactioncommerce/file-collections@0.1.0...@reactioncommerce/file-collections@0.1.1) (2018-02-20)


### Bug Fixes

* Improve FileCollection error message passed on from store ([2178344](https://github.com/reactioncommerce/reaction-file-collections/commit/2178344))
* **FileRecord:** Support calling upload() with no options ([f379890](https://github.com/reactioncommerce/reaction-file-collections/commit/f379890))
* **MeteorFileCollection:** Make find and findOne work in browser ([447e58c](https://github.com/reactioncommerce/reaction-file-collections/commit/447e58c))




<a name="0.1.0"></a>
# 0.1.0 (2018-02-19)


### Bug Fixes

* Clean up FileCollection method results, add raw option to more ([052514e](https://github.com/reactioncommerce/reaction-file-collections/commit/052514e))
* Proper errors for find methods on client/server ([d796a76](https://github.com/reactioncommerce/reaction-file-collections/commit/d796a76))


### Features

* Add absolute URL option ([9d00da3](https://github.com/reactioncommerce/reaction-file-collections/commit/9d00da3))
* Allow accessing metadata directly from a FileRecord instance ([8984e8e](https://github.com/reactioncommerce/reaction-file-collections/commit/8984e8e))
* Set up lerna and semantic-release ([5f38fe1](https://github.com/reactioncommerce/reaction-file-collections/commit/5f38fe1))

# v1.7.0
#### 01/29/2018

This release, along with the next one or two, make changes to our `.eslintrc` file

This release introduces the following

#### Import
`eslint-plugin-import` https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
We have added the following import rules:
```
"import/export": "error",
"import/order": ["error", {
    "groups": [
    "builtin",
    "external",
    "internal",
    "parent",
    "sibling",
    "index"
    ]
}],
"import/newline-after-import": "error",
"import/no-duplicates": "error",
"import/no-mutable-exports": "error",
"import/no-named-default": "error",
```
These rules enforce consistency for imports and exports. Most linting errors related to these should be fairly simple to fix, but if you have duplicate or mutable exports, there may be a little bit of work to do.

####
We've added the following base eslint rules. You can find their descriptions and examples of failing and passing code here: https://eslint.org/docs/rules/
```
"block-spacing": ["error", "always"],
"computed-property-spacing": ["error", "never"],
"dot-location": ["error", "property"],
"function-paren-newline": ["error", "multiline"],
"new-parens": "error",
"newline-per-chained-call": ["error", { "ignoreChainWithDepth": 4 }],
"object-shorthand": ["error", "always"],
"operator-assignment": ["error", "always"],
"prefer-arrow-callback": ["error", { "allowNamedFunctions": false, "allowUnboundThis": true }],
"space-unary-ops": ["error", {
  "words": true,
  "nonwords": false,
  "overrides": {}
}],
"template-curly-spacing": "error"
```
With all of these new rules, it's highly likely that there will be some linting errors in your own codebase when you merge this release. We recommend that you update your code to follow our new eslint ruleset. We've adopted this ruleset to ensure our code is cleaner, more readable, more consistent, and less prone to errors.

If you absolutely do not want to follow these rules or wish to follow some, you can remove or comment out any that do not fit the style you wish to follow. That should satisfy eslint. Again, we recommend updating your project to follow the new Reaction eslint rules.

## Code Style
 - style: Enable rules and resolve errors (issue 7) (#3596) ... Resolves #3572
 - style: Enable eslint template-curly-spacing rule (#3590) 
 - style: Enable rules and resolve eslint errors (issue 2) (#3587) ... Resolves #3567
 - style: resolve part 1 of eslint rule prefer-destructuring (#3591)
 - style: enable eslint rules for import, parens, and chained calls (#3586) ... resolves #3568
 - style: Enable eslint space-unary-ops (#3588)
 - style: enable eslint import rules (#3585)
 - style: eslint rule updates (issue 6) (#3581)

## Fixes
 - fix: sms TypeError: Cannot read property 'profile' of undefined (#3481) ... Resolves #3356
 - fix: Wrong subject for generated emails (#3536)
 - fix: Email logs and email job queuing should check permissions (#3553)
 - fix: Avalara: Return options.result on MethodHooks.after("cart/copyCartToOrder") call (#3539) ... Resolves #3540
 - fix: google analytics script not loaded (#3561) ... Resolves  #3450

## Performance
 - refactor: Dynamic load SMS pkgs to make server startup faster (#3594)
 - refactor: Remove unused hook (#3577)

## Docs
 - docs: add security vulnerability reporting link and email address (#3603)

## Contact the team
We've added our security reporting instructions to our readme:
[Security reporting instructions](https://docs.reactioncommerce.com/reaction-docs/master/reporting-vulnerabilities): Report security vulnerabilities to [security@reactioncommerce.com](mailto:security@reactioncommerce.com). 

## Contributors
Thanks to @liyucun, @glmaljkovich, @duanhong169 for contributing to this release.

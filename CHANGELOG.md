# v1.14.1
## Patch release
Resolves issues found after releasing `1.14.0` - one causing jsdoc to fail during CI builds for the `master` branch, and another where method hooks were running incorrectly occasionally for `catalog/publish/products` and `accoutns/addressBookAdd`. See specific PRs for more details.

## Meteor App
### Bugfixes
 - fix: Ensure method hooks always run with correct timing (before and after method) (#4537) .. Resolves #4437
 - fix: jsdoc promise returns (#4539)
 - fix: Null Guarding in GroupsTableCell (#4440)

 ## Contributors
Thanks to @pmn4 for contributing to this release :tada:

## NPM Package Version Changes
There are no dependency changes in this release

# v1.14.0
## Removing Optional Plugins
As part of our focus simplifying the core Reaction application and improving performance, we've [made the decision to remove optional plugins from the core application](https://blog.reactioncommerce.com/the-road-ahead-product-updates-june-2018/). From our blog post on this topic:
> It’s about quality over quantity. As a part of our initiative to simplify Reaction, we’re focusing on providing one reference application per feature and moving all others over to community-sponsored packages. We’ll be migrating packages, APIs, and schemas over to npm. It’s a standard approach to package management, one that improves the developer experience overall.

Here’s how it will look:

|Category|Reaction default(s)|Community package(s)|
|---|---|---|
|Payments|Stripe, example payment package|PayPal, Authorize.net, Braintree|
|Taxes|Flat rate|Avalara, TaxCloud, TaxJar|
|Shipping|Flat rate|Shippo|
|Connectors|CSV connector|Shopify connector|

As the first step of this process we've moved a number of packages from the https://github.com/reactioncommerce/reaction repo to independent repositories in the new https://github.com/reaction-contrib organization. You can install these packages by following the instructions located inside of each new repository. Once installed they should work as they did in v1.13. Any issues you have with updating these packages should be filed in the repos created for these packages and not in the core Reaction repo going forward. If you're interested in contributing to or helping to maintain any of the packages that we've moved to reaction-contrib, please reach out to @zenweasel and he can get you setup.

The list of packages that have been removed in this release is as follows:
  - Shopify
  - TaxCloud
  - Avalara
  - Authorize.net
  - Paypal
  - Braintree
  - TaxJar
  - Advanced Inventory Management
  - Shippo
  - SMS
  - Discount Rates (unused, not the same as our current discount codes)
  - Logging (unused by core application)

This work is listed as a breaking change. If your application relies on any of these packages, you will have to install them independently of Reaction going forward. This release will not destroy data associated with these plugins, so you should be able to safely update without losing information. However, please be sure to test this for your specific application before deploying to production and as always, backup your data before updating versions.

## GraphQL Cart
This release contains the Cart and Checkout GraphQL schemas along with several cart queries and mutations. We're starting to make some changes to the core cart schemas for Reaction and the process that we use to create and identify carts.

One of these changes is when we create a cart for a customer. To this point, we've created a cart document for each and every visitor to a Reaction storefront. Going forward we'll be creating carts on demand. This means that a customer will not have a cart associated with them until they first add a product to the cart. This is how we've architected the GraphQL API to work and we've made some changes to the legacy Reaction cart system to put it in sync.

We're signifincantly adjusting the Cart schema as well. The best way to understand all of this will be to read through the updated GraphQL Cart Schema in #4307 and #4390 but I'll try to note some things to be aware of going forward.

A cart will have either an account associated with it or may be anonymous.

A cart will have an array of items associated with them. As we will be lazy in creating carts, when the cart is created this array of items will have at least one item in it. We do not destory carts if a customer removes all items from a cart, so it is possible that there will be an empty array of items inside of a cart.

One of the major changes to carts is related to how we store information necessary to create an order from a cart. We're introducing a new field `checkout` to the cart schema which you can dig into in #4309. This will be where fulfillment information, payment information, addresses and any other information necessary to process a checkout will be stored.

Recognizing the need to be able to handle orders which have items that require different types of fulfillment, we're organizing items into what we're calling "Fulfillment Groups." The most basic example is that a fulfillment group could be a group of items that is getting shipped to a specific address. For an order with `n` items, there can exist up to `n` fulfillment groups within that cart. This specific release doesn't introduce any new functionality for adding new types of fulfillment groups or splitting a single cart into multiple fulfillments, but it does lay the groundwork for splitting orders, creating new fulfillment types such as an in store pickup, ship to store, digital downloads, or generated license keys.

We're currently mapping this new GraphQL Schema to the existing Reaction Simple Schema, but will be transitioning all of our existing schemas to match (more or less) our new GraphQL schemas going forward.

A cart will still be associated with a single shop. This is consistent with current behavior.

There are two GraphQL Queries for fetching carts, one for getting anonymous carts `anonymousCartByCartId` and one for getting account carts `accountCartByAccountId`

This release introduces GraphQL Mutations for creating carts, adding items to carts, removing items from carts, updating cart items, and reconciling carts when a customer with an anonymous cart logs into an account.

`ReconcileCarts` is a new method which replaces and extends our previous `mergeCarts` method with additional functionality. ReconcileCarts has 3 modes: `merge`, `keepAnonymousCart`, and `keepAccountCart`. `merge` is the default mode and works identically to how the existing `mergeCarts` method works, where the anonymous cart is combined with the account cart, items are deduped, and quantities are incremented to match the combined qty of the items in the carts. `keepAnonymousCart` will keep only the items and the checkout information in the anonymous cart, and `keepAccountCart` will do the same but for the Account Cart.


## Breaking Changes
### Meteor App
#### File Organization
- We've moved all files from `/server` into plugins. All imports with paths that begin with /server will need to be changed for any custom code or community plugins. See the file changes in https://github.com/reactioncommerce/reaction/pull/4366/files to see examples of changing import paths from `/server` to relevant plugin paths.

#### Cart
- A cart is not created until items are added. Previously a cart was created for all users, including anonymous users, immediately if one was not found. This is not a breaking change for the core app, but any custom plugins may have code that will need to be updated to handle the possibility of there not being a cart.
- Update the signature of most cart methods to take an optional cartToken string param. Update all places that call these methods to pass in the token for anonymous carts.
- Carts and Orders no longer have userId. They now have accountId. Core client code has been updated, but custom code will need to look up the account for the user and then look up the cart or order from that.
- The CartItem SimpleSchema no longer includes variants and product, i.e., the entire variant and product objects are not copied to the cart item. Instead, certain properties that are needed are copied directly to the CartItem object. For example, item.productSlug. See the updated schema.
- `cart/removeCart` Meteor method behavior is the same as before, but the return value is now `{ cart }`
- The signature of the "cart/setAnonymousUserEmail" method has changed. It now takes cartId, token arguments. The client code that calls it has been updated, but any custom code calling it will need to be updated.
- Accounts.loginWithAnonymous is no longer available to client code. This was only used in one place, and similar logic has replaced it in that spot.
- workflow/pushCartWorkflow and workflow/revertCartWorkflow methods now require that you pass in the cartId rather than guessing which cart you intend.
- In general, be aware that cart.accountId may now be null. Previously, it would be set even for anonymous carts, to the account for the user with "anonymous" role. For now, order.accountId is still set after an anonymous order is placed.
- The "Reaction.sessionId" stored ID is now used only for auto-login of anonymous users. It is not used by any of the cart code. Also, the "Sessions" collection is no longer written to or published to clients. It will not be dropped automatically, but you can drop it if you no longer need it.

#### Checkout
- Stripe checkout now uses [Stripe Elements](https://stripe.com/elements) - for more details see #4325

#### Tags
- We're now limiting the tags publication to show only tags from the current active shop. This is more of a clarification of how this was supposed to work, but if you depended on all tags being published, this will cause unexpected behavior. See #4206 for specific changes.

#### Other
- Removal of previously included ancillary packages listed in the "Removing Optional Plugins" section
- The function `createCatalogProduct` has been moved into it's own file. This function was not being exported and should not create any issues, but be aware.
- The Catalog schema has been changed. It was in a "use at your own risk" state before this, but if you've been using it you may have to migrate some data
- We've removed the core plugin `Logging` which was used only by the Avalara plugin to this point. If you relied on this plugin, you'll need to reinstall it.

### GraphQL
- In the GraphQL context, there is no longer a methods object. Instead you can call any method with context.callMeteorMethod(name, ...args).
- In the GraphQL context, context.queries is now namespaced by which plugin the queries come from. For example, context.queries.userAccount is now context.queries.accounts.userAccount.

## Notable Features
### Deploy to Heroku Button
We've added a deploy to Heroku button which should appear in the project readme now. You can now deploy Reaction to Heroku by clicking the "Deploy to Heroku" button and then filling out hte information required by Heroku.

### Hashing Products
We're now hashing products to determine when a product changes that have not been published to the Catalog. This shows up as an indicator on the publish button when viewing a product that has unpublished changes.

### Serve js and css from CDN
We now provide an option to serve the bundled javascript and css files from a CDN. See #4316 for more information.

### robots.txt
We've added a permissive default `robots.txt` file. This file permits all bots to crawl and disallows bots from crawling `/resources`

## GraphQL DevServer
### Features
 - feat: GraphQL Cart Schema (#4307)
 - feat: GraphQL Cart checkout schemas (#4390)
 - feat: Add anonymousCartByCartId GraphQL query (#4382)
 - feat: createCart mutation, addCartItems mutation, and related cart/order schema changes (#4412)
 - feat: Meteor-free addressBookAdd method and GraphQL plugin reorg (#4167)
 - feat: Add `resolveAccountFromAccountId` resolver (#4495)
 - feat: remove cart items (#4474)
 - feat: update cart items quantity (#4472)
 - feat: create reconcileCarts mutation (#4443)
 - feat: Add accountCartByAccountId resolver (#4427)


## Meteor App
### Features
 - feat: Shippo address validation (#4086)
 - feat: Use token to create Stripe charges (#4325)
 - feat: Create deploy to heroku button (#4320)
 - feat: enable oplog in development Docker Compose config (#4420)
 - feat: Create product hash of published product properties (#4336)
 - feat: added CDN settings to reaction (#4316)
 - feat: Indicator to notify of pending product changes not yet published to catalog (#4383)
 - feat(marketplace): Limit Tags Publication to Those for the Current Shop (#4206)
 - feat: add robots.txt file (#4370)
 - feat: Remove account from anon carts, don't use session for carts (#4496)
 - feat(marketplace): Consideration for Marketplace Shops on Different URLs (#3332)

### Fixes
 - fix: update and pin to latest version of sharp package (#4466)
 - fix: Use hashtags and tagIds to form tags obj (#4415) .. Resolves #4414
 - fix: Marketplace Settings (#4334) .. Resolves #4333
 - fix: update dependencies (#4444)
 - fix: Invalidate circleci caches (#4432)
 - fix: changing product handle throws 404 (#4403)  Resolves #4023
 - fix: Tax and inventory toggle switches do not work (#4445)  Resolves #4401
 - fix: Taxcloud with marketplace setup. (#4140) Resolves #4089
 - fix: Options now have parent's taxCode (#4182)  Resolves #4141
 - fix(marketplace): also send notification to shop owners upon order creation (#4295)
 - fix: not publishing customer accounts (#4402) .. Resolves #4374
 - fix: Can't save discount codes (#4410) .. Resolves #4408
 - fix: Discount Codes React Table Not Rendering Correctly (#4411) .. Resolves #4247
 - fix: Unable to save custom tax rate (#4405) .. Resolves #4396
 - fix: low quantity/sold out flags not saving correctly in db (#4342)
 - fix: Scrolling to bottom adds more products to the view (#4243) .. Resolves #4090
 - fix: remove react-addons-create-fragment (#4164)
 - fix: change session active product when adding new product (#4313)
 - fix: missing styles on refund popover (#4300) .. Resolves #4005
 - fix: fix permissions of shop social settings (#4312)
 - fix: Archived products not being removed from Catalog (#4392)
 - fix: Default settings for parcel size (#4083)
 - fix: Update prerender.js (#4331)
 - fix(marketplace): Product Visibility for Marketplace Shops (#4259) .. Resolves #4092
 - fix: mislabeled schema (#4371)
 - fix: ActionView Component Typos (#4439)
 - fix: Cannot set replyTo or other field options when using Reaction.Email.send (#4380) .. Resolves #4343
 - fix: migration error preventing app startup (#4491)
 - fix: add media information to Variants and Options (#4468)
 - fix: Publish button infinite loop bug (#4488)
 - fix: client errors related to domain lookup changes (#4471)

### Performance
 - perf: Dynamically import Moment locales to reduce client bundle size (#4455) .. Resolves #4454
 - perf: Improve app startup time when large number of Accounts/Users exists (#4449) .. Resolves #4384

### Refactors
 - refactor: Use new Reaction component library components for the SMS settings form (#4318)
 - refactor: Remove "Catalog" from menu (#4385)
 - refactor: Move all /server files to plugins (#4366)
 - refactor: Update Catalog Schema (#4421)

### Plugin Migration
 - refactor: Remove Shopify plugin (#4395)
 - refactor: Remove TaxCloud plugin (#4428)
 - refactor: Remove Avalara plugin (#4398)
 - refactor: Remove Authorize.net plugin (#4310)
 - refactor: Remove Paypal plugin (#4339)
 - refactor: Remove Braintree plugin (#4351)
 - refactor: Remove disabled TaxJar plugin (#4348)
 - refactor: Remove inventory package (#4388)
 - refactor: Remove shipping-shippo plugin (#4460)
 - refactor: Remove SMS plugin (#4451)
 - refactor: Remove unused discount-rates plugin (#4458)
 - refactor: remove unused logging (#4476)

### Chores
 - chore: CircleCI step for deploying to an existing ECS cluster (#4487)
 - chore: make the snyk-security step a dependency for the docker-build step; s… (#4446)

## Contributors
Thanks to @pmn4 and @hrath2015 for contributing to this release :tada:

## NPM Package Version Changes
This is a list of all new, changed, and removed dependencies that exist in our dependency graph for a production build. This does _not_ include dev dependencies.
### New Dependencies
```
@babel/helper-module-imports@7.0.0-beta.51
@babel/types@7.0.0-beta.51
@emotion/babel-utils@0.6.7
@emotion/hash@0.6.5
@emotion/memoize@0.6.5
@emotion/serialize@0.8.5
@emotion/stylis@0.6.12
@emotion/unitless@0.6.5
@emotion/utils@0.7.3
@reactioncommerce/components@0.2.0
@types/graphql@0.12.6
abbrev@1.1.1
aproba@1.2.0
are-we-there-yet@1.1.5
argparse@1.0.10
array.prototype.flat@1.2.1
babel-code-frame@6.26.0
babel-core@6.26.3
babel-core@6.26.3
babel-generator@6.26.1
babel-helpers@6.24.1
babel-messages@6.23.0
babel-plugin-emotion@9.2.6
babel-plugin-macros@2.3.0
babel-plugin-syntax-jsx@6.18.0
babel-register@6.26.0
babel-template@6.26.0
babel-traverse@6.26.0
babel-types@6.26.0
babylon@6.18.0
bl@1.2.2
buffer-alloc-unsafe@1.1.0
buffer-alloc@1.2.0
buffer-fill@1.0.0
check-error@1.0.2
console-control-strings@1.1.0
convert-source-map@1.5.1
cosmiconfig@4.0.0
create-emotion@9.2.6
css-color-keywords@1.0.0
css-to-react-native@2.2.1
csstype@2.5.5
deep-extend@0.6.0
delegates@1.0.0
detect-indent@4.0.0
emotion@9.2.6
esprima@4.0.1
esutils@2.0.2
expand-template@1.1.1
find-root@1.1.0
fs-constants@1.0.0
fs-copy-file-sync@1.1.1
gauge@2.7.4
get-func-name@2.0.0
github-from-package@0.0.0
globals@9.18.0
has-unicode@2.0.1
home-or-tmp@2.0.0
ini@1.3.5
is-directory@0.3.1
is-finite@1.0.2
js-yaml@3.12.0
jsesc@1.3.0
json-parse-better-errors@1.0.2
json5@0.5.1
lodash.debounce@4.0.8
lodash.isequal@4.5.0
lodash.topath@4.5.2
lodash.uniqueid@4.0.1
lodash.unset@4.5.2
node-abi@2.4.3
noop-logger@0.1.1
nopt@1.0.10
npmlog@4.1.2
object-hash@1.3.0
object-is@1.0.1
os-homedir@1.0.2
os-tmpdir@1.0.2
p-try@1.0.0
pathval@1.1.0
prebuild-install@4.0.0
private@0.1.8
raf@3.4.0
rc@1.2.8
react-is@16.4.1
react-lifecycles-compat@3.0.4
react-outside-click-handler@1.2.0
react-stripe-elements@2.0.1
reacto-form@0.0.2
reflect.ownkeys@0.2.0
repeating@2.0.1
require-from-string@2.0.2
safer-buffer@2.1.2
saslprep@1.0.0
slash@1.0.0
spdx-correct@3.0.0
spdx-exceptions@2.1.0
sprintf-js@1.0.3
strip-json-comments@2.0.1
styled-components@3.3.3
stylis@3.5.3
stylis-rule-sheet@0.0.10
tar-fs@1.16.3
tar-stream@1.6.1
to-buffer@1.1.1
to-fast-properties@1.0.3
to-fast-properties@2.0.0
touch@1.0.0
trim-right@1.0.1
which-pm-runs@1.0.0
wide-align@1.1.3
```

### Updated Dependencies
```
ansi-styles@3.2.1
apollo-cache-control@0.0.10
apollo-link@1.2.2
apollo-server-module-graphiql@1.4.0
apollo-tracing@0.1.4
apollo-utilities@1.0.16
async@2.6.1
attr-accept@1.1.3
autosize@4.0.2
aws4@1.7.0
base64-js@1.3.0
bcrypt-pbkdf@1.0.2
body-parser@1.18.3
bowser@1.9.4
brace-expansion@1.1.11
bson@1.0.9
buffer-from@1.1.0
buffer-from@1.1.0
buffer@5.1.0
camelcase@4.1.0
caniuse-lite@1.0.30000865
chai@4.1.2
chalk@2.4.1
classnames@2.2.6
clone@2.1.1
color-convert@1.9.2
color-name@1.1.1
color@3.0.0
combined-stream@1.0.6
commander@2.16.0
concat-stream@1.6.2
configstore@3.1.2
consolidated-events@2.0.2
css-in-js-utils@2.0.1
cuid@2.1.1
d3-color@1.2.0
d3-format@1.3.0
d3-interpolate@1.2.0
d3-scale-chromatic@1.3.0
d3-scale@1.0.7
d3-time-format@2.1.1
d3-time@1.0.8
debug@3.1.0
deep-eql@3.0.1
direction@1.0.2
disposables@1.0.2
dnd-core@2.6.0
dom-helpers@3.3.1
dom7@2.0.7
dtrace-provider@0.8.7
duplexify@3.6.0
ecdsa-sig-formatter@1.0.10
electron-to-chromium@1.3.52
error-ex@1.3.2
es-abstract@1.12.0
extend@3.0.2
fast-deep-equal@1.1.0
fbjs@0.8.17
fibers@2.0.2
form-data@2.3.2
get-caller-file@1.0.3
get-node-dimensions@1.2.1
graphql-extensions@0.0.10
graphql-fields@1.1.0
graphql-relay@0.5.5
has-flag@1.0.0
has@1.0.3
hoist-non-react-statics@2.5.5
hosted-git-info@2.7.1
http-errors@1.6.3
i18next-browser-languagedetector@2.2.2
iconv-lite@0.4.23
ieee754@1.1.12
immutability-helper@2.7.1
inline-style-prefixer@4.0.2
invariant@2.2.4
is-arrayish@0.3.2
is-callable@1.1.4
js-tokens@4.0.0
jwa@1.1.6
jws@3.1.5
libphonenumber-js@1.2.21
lodash-es@4.17.10
loose-envify@1.4.0
lru-cache@4.1.3
make-dir@1.3.0
match-sorter@2.2.3
material-colors@1.2.6
mime-db@1.35.0
mime-types@2.1.19
mimic-fn@1.2.0
mimic-response@1.0.1
minimist@1.2.0
minipass@2.3.3
moment-timezone@0.5.21
moment@2.22.2
mongodb-core@3.1.0
mongodb@3.1.1
nan@2.10.0
nock@9.4.2
node-fetch@2.1.2
node-loggly-bulk@2.2.3
object-keys@1.0.12
object-keys@1.0.12
p-limit@1.3.0
parse-json@4.0.0
path-parser@4.2.0
path-to-regexp@2.2.1
pify@2.3.0
postcss@6.0.23
prerender-node@3.1.1
process-nextick-args@2.0.0
prop-types-exact@1.2.0
prop-types@15.6.2
propagate@1.0.0
pump@1.0.3
pumpify@1.5.1
qs@6.5.2
query-string@5.1.1
radium@0.22.1
raw-body@2.3.3
react-autosuggest@9.3.4
react-autowhatever@10.1.2
react-color@2.14.1
react-cursor-position@2.4.1
react-dates@17.1.0
react-dnd-html5-backend@2.6.0
react-dnd@2.6.0
react-dropzone@4.2.13
react-image-magnify@2.7.0
react-loadable@5.4.0
react-moment-proptypes@1.6.0
react-portal@4.1.5
react-router-dom@4.3.1
react-router@4.3.1
react-select@2.0.0-beta.7
react-side-effect@1.1.5
react-table@6.8.6
react-transition-group@2.4.0
react-with-styles-interface-css@4.0.3
react-with-styles@3.2.1
reaction@1.14.0 /Users/spencer/reaction/reaction
readable-stream@2.3.6
request@2.87.0
resize-observer-polyfill@1.5.0
retry-request@3.3.2
safe-buffer@5.1.2
safe-json-stringify@1.2.0
search-params@2.1.3
semver@5.5.0
shallowequal@1.1.0
sharp@0.20.5
simple-get@2.8.1
slugify@1.3.1
source-map-support@0.5.6
source-map@0.7.3
spdx-expression-parse@3.0.0
spdx-license-ids@3.0.0
sshpk@1.14.2
stable@0.1.8
statuses@1.5.0
string-width@1.0.2
string_decoder@1.1.1
stringstream@0.0.6
stripe@5.10.0
supports-color@5.4.0
sweetalert2@7.25.6
swiper@4.3.3
symbol-observable@1.2.0
tar@4.4.4
tether@1.4.4
tough-cookie@2.3.4
type-detect@4.0.8
type-is@1.6.16
ua-parser-js@0.7.18
underscore@1.9.1
uuid@3.3.2
validate-npm-package-license@3.0.3
velocity-react@1.4.1
warning@4.0.1
whatwg-fetch@2.0.4
which@1.3.1
wordwrap@0.0.3
zen-observable-ts@0.8.9
zen-observable@0.8.8
```

### Removed Dependencies
```
42-cent-base
42-cent-util
@braintree/wrap-promise
@sindresorhus/is
@types/node
UNMET PEER DEPENDENCY graphql@^0.10.0 || ^0.11.0 || ^0.12.0
aphrodite
array.prototype.flatten
authorize-net
base64url
braintree
buffer-crc32
cacheable-request
chain-function
clone-response
connect-query
dateformat
debuglog
deprecate
duplexer3
from2
got
has-symbol-support-x
has-to-string-tag-x
http-cache-semantics
into-stream
is-object
is-plain-obj
is-retry-allowed
isemail
isurl
joi
json-buffer
json-stable-stringify
jsonify
jsonwebtoken
keyv
lodash.isboolean
lodash.isinteger
lodash.isnumber
lodash.once
lowercase-keys
nexmo
normalize-url
p-cancelable
p-is-promise
p-timeout
paypal-rest-sdk
pop-iterate
prepend-http
q
react-addons-create-fragment
react-addons-pure-render-mixin
responselike
rootpath
scmp
shippo
shopify-api-node
sort-keys
stopcock
string-hash
timed-out
topo
twilio
url-parse-lax
url-to-options
weak-map
```

## Metrics
You don't improve what you don't measure. In efforts to improve the size of our bundles, the time to first paint, time to interactive, and overall performance of our applications, we're starting to report on bundle size and some performance metrics in every release. With effort and persistence, we'll see these numbers improve over time.

### Bundle Size
We measure bundle size by building the application using `meteor build` and then measuring the js and css bundle size with the command `wc -c /path/to/js-bundle-file.js`

**JS Modern Browsers:** 4872kb
**JS Legacy Browsers:** 5104kb
**CSS All Browsers:** 392kb


# v1.13.1

This release exclusively includes a patch update to Meteor from `1.7.0.1` to `1.7.0.3`

This release should be installed by anyone on Reaction 1.13.0 and includes an important security update to Node, updating to version 8.11.3 of Node, which is an important security release.

The underlying meteor-babel npm package has also been updated to version 7.0.0-beta.51.


## Security
- security: Update to Meteor 1.7.0.3 (#4368)

# v1.13.0

## Removal of Legacy Product Revision Control system
The major change in this release is that we've removed the existing revision control system in favor of publishing Products to the Catalog. The existing revision control system contained some powerful ideas, but was complex and intertwined into many areas of the app that were not directly related to Product. By removing the old revision control system, we've paved the way to substantially improve product grid performance, especially for Operators and we've simplified the product publication logic.

This removes all code, hooks, collections, and packages related to revision control.

**Breaking changes:**
 - Any custom packages that depend on the `Revision` control system.
 - Operators will no longer be able to "undo" changes to a product. Instead products are published through the catalog
 - Any _unpublished_ changes to products will be lost when upgrading to `1.13.0`. In this release, it's possible that if you were to downgrade that you would see the unpublished changes again, but that may cause unexpected behavior. We recommend either publishing or discarding any changes to your products before upgrading to this release.
 - Similarly, any products that have been created but not published will demonstrate unexpected behavior. To avoid this undesirable behavior, publish any newly created, unpublished products prior to upgrading to this release.

 - **All plugin authors** will need to update your `package.json` with a change to the babel config similar to what was done [here](https://github.com/reaction-contrib/meteor-authorize-net/commit/f19a5cf7591a17f426e67bd3737af5a4d1c7a64a)


## Update to Meteor 1.7
This update brings some enormous improvements to the amount of time it takes to rebuild the application in development after making a file change. In some (less than perfectly scientific) tests that I ran testing file changes between 1.7 and 1.6.1 I saw 50%-90% improvements in the reload time. Your experience may vary depending on how much you've customized Reaction, your computer specs, and your specific development setup, but I fully expect this to be a noticeable improvement for anyone working with Reaction.

There are some [early](https://github.com/meteor/meteor/issues/9949) [reports](https://github.com/meteor/meteor/issues/9945) that the included update to the MongoDB driver may have [some kinks](https://github.com/meteor/meteor/issues/9944) to work out, so I'd follow those issues on Meteor's repo if that's a cause for concern for you. These reports are all coming from a single person, and we haven't experienced any of these issues in particular yet, but we'll be keeping an eye on them.

##
We ran into a few issues with `npm install` that we resolved in #4317. One product that came out of this investigation was some documentation for how to properly clean up and rebuild docker images in Reaction.

To stop and clean up your images
```sh
  docker-compose down -v --rmi local --remove-orphans
```

To rebuild your Reaction images
```sh
  docker-compose up --build --force-recreate --renew-anon-volumes
```

If you only want to run Reaction and not the GraphQL DevServer
```sh
  docker-compose up --build --force-recreate --renew-anon-volumes reaction
```

If you only want to run the DevServer and not the Meteor app
```sh
  docker-compose up --build --force-recreate --renew-anon-volumes devserver
```

## Meteor App
### Performance
 - perf: remove revision control (#4238)
 - perf: update to Meteor 1.7 (#4265)

### Bug Fixes
 - fix: Use catalog collection for PDP (#4324)
 - fix: Import fixture data only if collections empty (#4327) .. Resolves #4326
 - fix: Invalid class name: .variant-list-item-{variant._id} (#4217)
 - fix: NPM build issue in Docker build (#4317)
 - fix: add getAutoValues: false to discounts/codes/remove (#4288)
 - fix: hadolint image version (#4306)
 - fix: CI step failure to tag Docker image with latest release version (#4304)
 - fix: admin products publication slowness (#4260)
 - fix: remove inventoryPolicy check on low inventory (#4298)

### Refactors
 - refactor: non meteor schemas (#4266) .. Resolves #4263

### Tests
 - test: new mocks factory (#4276) .. Resolves #4246
 - test: run snyk when package.json has changed or base is master (#4285)

### Docs
 - docs(jsdoc): document all Meteor Template helpers in 1 @namespace (#3841) .. Resolves #3840

## GraphQL Dev Server
### Features
 - feat: add Media to Tag Schema and GraphQL query (#4270)

### Chore
 - chore: update default GraphQL query limit values (#4297)

## Contributors
Thanks to @mikeumus for contributing to this release. 🎉



# v1.12.1
## Bug Fixes
- fix: handle products without positions obj .. Resolves #4299

This release is a hotfix for #4299 which was discovered shortly after v1.12.0 was released.

The issue was releated to a type error that was thrown during a migration:

> If any documents in `Catalog` collection do not have a `positions` property, migration fails on startup on first start after migration to v1.12.0. The migration is left locked. The error message is:

```
0|reaction | TypeError: Cannot convert undefined or null to object
0|reaction |     at Function.keys (<anonymous>)
0|reaction |     at items.forEach (imports/plugins/core/versions/server/migrations/25_update_catalog_schema.js:28:12)
```

# v1.12.0

## Breaking changes
We've made some significant changes to the structure of the data that we publish to the Catalog in #4218. We have created an automated migration for these changes in #4272. If you have made other changes to the catalog in your app or in a plugin, this migration may not work out of the box for you. We'd recommend migrating a test or staging instance of your application with similar data before applying this update to your production application.

From the PR notes to #4218, here's a list of the changes

### Method argument change
"products/updateProductPosition" method now takes a tag ID rather than tag name as its third argument

### Media change

The `media` property on catalog items is still an array of objects, but the structure of those objects has changed.

BEFORE:
```js
{
  metadata: {}, // the full metadata object from the Media doc
  thumbnail: "", // a URL
  small: "", // a URL
  medium: "", // a URL
  large: "", // a URL
  image: "", // a URL
}
```

AFTER:
```js
{
  priority, // copied from metadata
  toGrid, // copied from metadata
  productId, // copied from metadata
  variantId, // copied from metadata
  URLs: {
    thumbnail: "", // a URL
    small: "", // a URL
    medium: "", // a URL
    large: "", // a URL
    original: "", // a URL
  }
}
```

Also, the media array is now sorted in ascending `priority` order.

### Deleted and hidden variants change

When published to the catalog, the `variants` array on the catalog item now includes only those variants where `isDeleted` IS NOT true and `isVisible` IS true.

### Product props separated from catalog item props

Most product properties that were formerly on the catalog item itself are now moved to a `product` object property.

### Explicit property copying

Previously all product and variant props were blindly copied into the catalog item. Now, we explicitly copy only the props we want, sometimes changing their names.

### Property name changes

- `variant.taxable -> variant.isTaxable`
- `variant.variantId` added, currently the same as variant._id but might not always be. A reference back to the variant in the Products collection.
- `product.taxable -> product.isTaxable`
- `product.productId` added, currently the same as product._id but might not always be. A reference back to the product in the Products collection.
- `product.handle -> product.slug`
- `product.hashtags -> product.tagIds`

`product.twitterMsg` and `product.facebookMsg` and `product.googleplusMsg` and `product.pinterestMsg` are converted to a `product.socialMetadata` array like this:

```js
socialMetadata: [
  { service: "twitter", message: product.twitterMsg },
  { service: "facebook", message: product.facebookMsg },
  { service: "googleplus", message: product.googleplusMsg },
  { service: "pinterest", message: product.pinterestMsg }
]
```

### New Pricing Object

We've deprecated the `price` property on catalog products, variants, and options. There is a new property called `pricing`, which is a map keyed by currency code in MongoDB, and in GraphQL is converted to an array.

The GraphQL schema:

```graphql
"The product price or price range for a specific currency"
type ProductPricingInfo {
  """
  A comparison price value, usually MSRP. If `price` is null, this will also be null. That is,
  only purchasable variants will have a `compareAtPrice`.
  """
  compareAtPrice: Float

  "The code for the currency these pricing details applies to"
  currency: Currency!

  """
  UI should display this price. If a product has multiple potential prices depending on selected
  variants and options, then this is a price range string such as "$3.95 - $6.99". It includes the currency
  symbols.
  """
  displayPrice: String!

  "The price of the most expensive possible variant+option combination"
  maxPrice: Float!

  "The price of the least expensive possible variant+option combination"
  minPrice: Float!

  """
  For variants with no options and for options, this will always be set to a price. For variants
  with options and products, this will be `null`. There must be a price for a variant to be
  added to a cart or purchased. Otherwise you would instead add one of its child options to a cart.
  """
  price: Float
}
```

These are currently mapped as follows, but in the future you will be able to have different prices per currency that your shop supports.

```js
pricing: {
      [shopCurrencyCode]: {
        compareAtPrice: variant.compareAtPrice || null,
        displayPrice: variantPriceInfo.range,
        maxPrice: variantPriceInfo.max,
        minPrice: variantPriceInfo.min,
        price: typeof variant.price === "number" ? variant.price : null
      }
    },
```

### Catalog Item props

All product props other than `positions` are now on the `product` object, so there are a few new properties on the catalog item itself:
- _id (this is no longer the same as the product ID)
- shopId (stays here AND on `product` obj)
- createdAt
- updatedAt

### ReactionProduct.getTag

The `ReactionProduct.getTag` helper function is renamed to `ReactionProduct.getTagIdForPosition` and returns the tag ID rather than name. If there's no tag in the route path, it returns "_default" rather than the lowercased shop name.

## Meteor App
 ### Features and Improvements
 - feat: Catalog schema changes (#4218)
 - feat: Catalog schema migration (#4272)

### Bugfixes
 - fix: Limit Products when in Edit Mode (#4256) .. Resolves #4254
 - fix: added event param to onBlur method in numericInput component (#4251)
 - fix: Load more products working now (#4233) .. Resolves #4090
 - fix: show `.00` cents for whole-dollar amounts in price range (#4222)
 - fix: get react root node correctly (#4172)

### Tests
 - Reduce Risk of Test False Positives (#4033)

### Chores
 - chore: Update to our latest eslint config (#4282)
 - chore: resolve snyk issues (#4257)
 - chore: Use NPM random package (#4208)

## GraphQL Dev Server
### Features and Improvements
 - feat: catalog price sort (#4255) .. Resolves #4245
 - feat: devserver improvements (#4220)
 - feat: add description and name to shop query (#4209)
 - feat: catalogItem GQL query (#4200) .. Resolves #4106
 - feat: create connection/edge resolver helper (#4225)

### Bugfixes
 - fix: hasNextPage being false, even with a known next page (#4249)
 - fix: improve hasNext/hasPrevious (#4231)
 - fix: pagination (#4228)
 - fix: first value pagination (#4204) .. Resolves #4186

### Chores
 - chore: access media through devserver app (#4216)

## Docs
 - docs: remove community calls from readme.md (#4279)
 - docs: clean up jsdoc comments, namespace organization (#4213)


## Contributors
Thanks to @pmn4 for contributing to this release! 🎉

# v1.11.0

The major focus of `v1.11.0` has been on our GraphQL API. We've added most of the queries and mutations that are necessary for building a headless client to interact with `Accounts`. We're actively doing experiments on how we'll recommend connecting to this GraphQL client and we'll start publishing some of our initial client apps to interact with this GraphQL API in the near future.

## GraphQL
 - feat: GraphQL remove account from group mutation (#4102)
 - feat: GraphQL invite shop member (#4103)
 - feat: GraphQL add account to group mutation (#4095)
 - feat: GraphQL address remove mutation (#4087)
 - feat: GraphQL address update mutation (#4077)
 - feat: GraphQL address add mutation (#4068)
 - feat: GraphQL roles query (#4076)
 - feat: GraphQL group and groups query (#4053)
 - feat: GraphQL connections and devserver app (#4048)
 - feat: GraphQL add primaryShopId query (#4175)
 - feat: GraphQL add setAccountProfileCurrency mutation (#4094)
 - feat: GraphQL tags query (#4165)
 - feat: GraphQL Update queries to not need Meteor (#4097)
 - refactor: GraphQL transform types using resolvers (#4166)
 - refactor: GraphQL switch to .graphql files for schema (#4169)
 - docs: GraphQL add some missing schema docs (#4160)

 ## Features
 - feat: styling shop slug box for Shopify (#4091) .. Resolves #2780
 - feat: convert AddressBook to react (#4054) .. Resolves #3518
 - feat: Accept Shop Data when Inviting Shop Owner (#3456)

## Refactors
 - refactor: extract schemas API to an npm package (#4149)
 - refactor: extract Logger API into new npm package (#4110)
 - refactor: extract Hooks API to an npm package (#4147)
 - refactor: remove unused Themes collection (#4198)

 ## CI
 - chore: Add snyk check to CI config; Bump base version (#4002)

 ## Fixes
 - fix: preference writing in marketplace (#4111)
 - fix: onClick to image too (#4067) .. Resolves #4058
 - fix: wait for slugify to show up before returning slug (#4049)
 - fix: use numericInput for pricing (#3999) .. Resolves #3821
 - fix: credit card accepts invalid expiration date (#3795)
 - fix: check permission before publish (#3885) .. Resolves #3754
 - fix: multiple instances of Components.Login causes a browser warning (#4044)
 - fix: Currency as object (#4156) .. Resolves #4152
 - fix: no access-denied in "accounts/setProfileCurrency" for self (#4199)
 - fix: client side validation on address book (#4183)
 - fix: Fix Simple Schema runtime errors (#4190) .. Resolves #4173
 - fix: Remove _sleepForMs from tests (#4161)
 - fix: #4037: Paginate and Filter Orders Subscription on Admin Dashboard (#4038)
 - fix: for "Product publication handle regex match issues with similar product handles (#4065)
 - fix: #4057: Admin should have media editable (#4072)
 - fix: Make shipping discount code case-insensitive (#4082)
 - fix: Error when enabling Shopify inventory hooks (#4148)
 - fix: Correct some translation errors for i18n/it.json (#4174)
 - fix: inventory badge component added #4032 .. Resolves #4009

## Docs
 - docs(jsdoc): #3840 DOM module - add @memberof, @method (#3842)
 - docs: #3840 jsdoc - document fixtures (#3873)


 ## Contributors
 Thanks to @pmn4, @glmaljkovich, and @awles for contributing to this release

# v1.10.0

## Collection Hooks | Breaking Change!
The biggest change in 1.10.0 is the removal of the [meteor-collection-hooks](https://github.com/matb33/meteor-collection-hooks) package. If your app or plugin is dependent on collection hooks, we'd recommend refactoring to eliminate the need for those types of hooks. If you're not up for refactoring you can just add that package back into your app though you'll lose some of the benefits that Reaction will see by eliminating that dependency. The removal of this package is a breaking change for any plugin that depends on collection hooks or uses the `direct` method to update a collection. For example, `Products.before`, `Products.after`, and `Products.direct` will no longer work. These hooks have all been migrated to our event hook system. If you were using Collection hooks to perform an action that you cannot perform in 1.10.0 with the current set of event hooks, please file an issue and we can determine if we need to add additional event hooks. This change should lead to much simpler code that is easier to understand.

## New GraphQL API
In addition to a few performance updates, refactors, and bug fixes, this release starts the rollout of our GraphQL API. Until further notice, this GraphQL API should be considered a prototype and should not be used for production. If you're interested in following along with our GraphQL work, tracking our [GraphQL issues](https://github.com/reactioncommerce/reaction/issues?utf8=%E2%9C%93&q=is%3Aissue+graphql+) is probably the easiest way for now.

In short, this release adds a prototype GraphQL server running in the Reaction project with the following urls exposed:

```
/graphql - The GraphQL endpoint.
/graphiql - The GraphiQL user interface.
```

We'll be incrementally adding functionality to this GraphQL endpoint, but this release serves as the starting point for our GraphQL api.

 ## GraphQL
 - feat: GraphQL Prototype (#3898) .. Resolves #3935, Resolves #3928, Resolves #3910
 - feat: GraphQL Jest testing pattern (#3995) .. Resolves #3936
 - feat: Create GraphQL viewer query (#4019)
 - feat: Create GraphQL account query (#3991)

## Refactors
 - refactor: remove collection hooks in search mongo package (#3889) .. Resolves #3866
 - refactor: remove collection hooks for Products collection (#3825)
 - refactor: remove media hooks (#4035) .. Resolves #3994
 - refactor: hooks in the inventory package to use Hooks.Events (#3887)
 - refactor: remove collection hooks package (#4036)

## Performance
 - perf: Memoize/Cache getShopId to Reduce DB Load (#3510) .. Resolves #3507

## Fixes
 - fix: typo fix (#4000) .. Resolves #3975
 - fix: Browser console warning when beginning checkout (#3980)
 - fix: PDP Image gallery does not handle portrait sized images well (#3993)
 - fix: Cloning products is not reactive (#3964)
 - fix: Uploading Product Image (#4029)
 - fix: ProductsContainers are not replaceable (#4025)
 - fix: ProductGridItem is not replaceable (#4027)

## Tests
 - CI: Run Jest and Meteor tests in parallel (#4030)

## Docs
 - docs(jsdoc): namespace MethodHooks into its own JSDoc section. (#3844) .. Resolves #3840

# v1.9.0
This release contains a lot of fixes, some of them performance related and several enormous refactors.
The three biggest changes are:
1. We've migrated from the Meteor version of Simple Schema to the npm version. See notes in the breaking changes section below.
2. We've dropped our dependency on the deprecated Meteor-CollectionFS package. We've replaced it with an npm package we've created called [reaction-file-collections](https://github.com/reactioncommerce/reaction-file-collections)
3. We've created a new catalog collection for use on the Product Grid when viewed by a consumer or other user without a product admin role

There's a full list of changes and fixes below, as well as detailed explanations of potential breaking changes and what you might need to do to migrate

## BREAKING CHANGES
This is a breaking change for any plugin that implements or modifies a schema based on the Meteor simple-schema package.

### From the Simple Schema update
This PR updates the `aldeed:simple-schema` Meteor package dependency to instead depend on the `simpl-schema` NPM package, which is the newest release of the same library. As part of this change, there are several breaking changes and other gotchas to be aware of.

IMPORTANT! The NPM package does not play nice with the previous Meteor package. After updating to this Reaction release, run the app one time, and then look at the .meteor/versions file. Make sure that aldeed:simple-schema is not listed. If it is there, that is because you depend on another Meteor package that depends on aldeed:simple-schema. You will have to update or remove any such packages (with meteor remove / meteor add) until aldeed:simple-schema disappears from your .meteor/versions file.
Search your app for any import { SimpleSchema } from "meteor/aldeed:simple-schema" lines that you have added in your custom code, and replace them with import SimpleSchema from "simpl-schema"
Be aware that the package name does not have the "e" on "simpl". (There is a different NPM package called simple-schema with the "e", and that is NOT the one you want.)
If you have your own custom schemas, refer to the SimpleSchema changelog to update them for the breaking changes: https://github.com/aldeed/meteor-simple-schema/blob/master/CHANGELOG.md#200
If you use attachSchema in your code, be aware that passing an array to attachSchema will no longer work. You should first merge all the schemas and then pass the combined schema to attachSchema

Please read the PR if you need more details [Use NPM SimpleSchema rather than Meteor #3331](https://github.com/reactioncommerce/reaction/pull/3331)

### From the removal of CollecitonFS
#### If you've saved the file URLs anywhere, they're now different.
```
/assets/files/:collectionName/:fileId/:filename
```
becomes
```
/assets/files/:collectionName/:fileId/:primaryStoreName/:filename
```

and
```
/assets/files/:collectionName/:fileId/:filename?store=storeName
```

becomes

```
/assets/files/:collectionName/:fileId/:storeName/:filename
```

#### We've deleted some unused Blaze templates rather than update URL handling within them:
- shopBrandImageOption
- ordersListItems
- select
- upload
- productMetaField
- productMetaFieldForm
- metaComponent
- productDetailEdit
- productDetailField
- productImageGallery
- imageDetail
- imageUploader
- productSocial
- variantList
- variant
- Media-related publishing is changed and improved:

#### Publications have been added, removed, or changed:
- `CartItemImage` publication is removed
- `CartImages` now takes an ID
- Added `ProductGridMedia` to replace Media being included with the products publication for the grid
- Added `ProductMedia`
- Added `OrderImages`, similar to `CartImages`, used for order now rather than reusing CartImages

Full notes on the PR to replace CFS #3782

### From the customer product catalog
The old `imports/plugins/included/product-variants/containers/productsContainer.js` has been renamed to `productsContainerAdmin.js` and a new component named `productsContainer.js` now handles which products container to load based on the user's permissions. Full notes on the PR #3876

### From the Dockerfile updates
reactioncommerce/base:v4.0.1 removed the following:
- Removed the conditional MongoDB installation (via $INSTALL_MONGO env). Use `mongo` as a service in docker-compose, see example in README.
- Removed the conditional PhantomJS installation (via $INSTALL_PHANTOMJS env). If PhantomJS is required in your build, you can include it in your custom Dockerfile.
Full notes on the PR

## Dockerfile Updates
- Base image updated to `reactioncommerce/base:v4.0.1` which has:
  - `node:8.9.4` as base image (same Debian base as before, but with Node 8 preinstalled)
  - Meteor 1.6.1 preinstalled
- [Multi-stage build support](https://docs.docker.com/develop/develop-images/multistage-build/).
  This helped reduce the size of the production image by removing un-required dependencies.
- Final production bundle uses `node:8.9.4-slim`

## Docker Compose changes
- Updated existing `docker-compose.yml` to serve as the config for running a local development environment.
- Added  a new `docker-compose-demo.yml` for testing out production builds (this is the replacement for the previous `docker-compose.yml`).
## Upgrades
- Use NPM SimpleSchema rather than Meteor (#3331)

## CI
We've updated our circle ci config to use [v2 of Workflows](https://circleci.com/docs/2.0/workflows/). This permits us to run additional automated tests on circle instead of using other services. We now have 6 workflow steps that must pass before a PR can be merged.

## Refactor
- refactor: rename Import to Importer (#3613) .. Resolves ##1364
- refactor: convert search modal wrapper to React (#3853)
- refactor: replace CFS (#3782)
- refactor: customer product grid publishing (#3876) .. Resolves #3662
- refactor: remove unused collection hook (#3950)

## Fix
 - fix: inventory updated on shopify sync (#3897) .. Resolves #3718
 - fix: settings startup error (#3939)
 - fix: email validation (#3899) .. Resolves #3733
 - fix: change all email verification links to use tokens (#3884)
 - fix: update shopId the right way. (#3947) .. Resolves #3945
 - fix: migration version after SimpleSchema NPM merge (#3929)
 - fix: ui glitches using dynamic merchandising (#3932)
 - fix: setting or changing a products perma-link causes hard refresh (#3755) .. #2246
 - fix: removing search-mongo plugin causes errors at startup (#3837) .. Resolves #3797
 - fix: `Reaction.getShopId` missing `()` (#3891)
 - fix: added delay and loader (#3796) .. #2863
 - fix: add back missing browser policy (#3894)
 - fix: discount codes limits are not honored (#3824) .. #3783
 - fix: remove cfs:graphicsmagick (#3869) .. Resolves #3868
 - fix: password validation (#3860) .. Resolves #3854
 - fix: set localstorage even when no Meteor.user exists (#3856) .. Resolves #3846
 - fix: handle misconfigured Avalara api (#3827) .. Resolves #3813
 - fix: fix for "capturing bulk orders throws server side error" (#3822) .. Resolves #3705
 - fix: shop switcher opens off-screen (#3809) .. Resolves #3619
 - fix: /shop added to URL (#3794) .. Resolves #2810
 - fix: adding country code to phone number before sending SMS (#3751) .. Resolves #3597
 - fix: changing the permalink before publishing a product results in "not found" (#3748)
 - fix: errors when updating default shipping and billing addresses (#3802)
 - fix: delayed response in localization settings (#3872)
 - fix: handle integer schema type when getting form field type (#3930)
 - fix: check for number if sms is enabled. (#3983) .. Resolves #3965
 - fix: marketplace shipping (#3981) .. Resolves #3979
 - fix: summary not shown in Invoice (#3989)
 - fix: dirty badge in product grid does not work (#3984)
 - fix: reactivity error when products are not published yet (#3970)
 - fix: global route hooks (#3896) .. Resolves #3895
 - fix: added all the missing avalara settings fields to the fieldsProps… (#3969)
 - fix: publishing group related to current shop (#3943) .. Resolves #3942
 - fix: break payment before sending to paypal (#3859) .. Resolves #1236
 - fix: delete shipping rates one at a time (#3968)
 - fix: card validator (#3892) .. Resolves #3875
 - fix: can't input refund properly (#3893) .. Resolves #3703
 - fix: clean paymentMethod objects before validating (#3961)
 - fix: console error during checkout (#3948)

 ## Chore
 - chore: add imports/plugins/custom to eslint ignore (#3901)
 - chore: update Docker base for multi-stage builds (#3653)
 - chore: use circleci workflows 2 in circle config (#3959)
 - chore: remove ability to load Meteor.settings from settings.json (#3951)
 - chore: upgrade react-dates to 16.3.6 (#3952)

## Docs
 - docs(jsdoc) - document and namespace Router.Hooks methods (#3874) .. Resolves #3840

## Contributors
Thanks to @pmn4 for contributing to this release!

# v1.8.2
## Fixes
 - fix: added unique to slug (#3745) .. Resolves #2736
 - fix: Correct Inventory updates when canceling an order (#3776)
 - fix: bulk order status corrected (#3807) .. Resolves #3692
 - fix: order refunding number input (#3826) .. Resolves #3702
 - fix: Changing user currency does not update prices (#3835)
 - fix: Fix invite shop owner (#3845) .. Resolves #3836

## Performance
 - perf: performance upgrades by refactoring shopSelectDropdown Trackers (#3651)
 - perf: Improve unnecessary translation loading (#3838)

## Features
 - feat: Allow for ShopId when adding Brand Assets (#3529)

## Refactor
 - refactor: Call OrdersList as a Component (#3848)

## Chore
 - chore: Add CodeTriage badge to reactioncommerce/reaction (#3666)
 - chore: Update React to 16.2.0 (#3801)

## Docs
 - docs(jsdoc): Namespace Hooks.Events methods and add examples (#3843) .. Resolves #3840

## Contributors
Thanks to @pmn4 and @willmoss1000 for contributing to this release

# v1.8.1

## Fixes
 - (fix): email status (#3781) .. Resolves #3701
 - (fix): cannot search accounts in search modal (#3829)

# v1.8.0

## Meteor 1.6.1
This release upgrades Reaction to Meteor 1.6.1

This is a possible BREAKING CHANGE. We've done our best to keep core reaction backwards compatible with this release, but as this update includes bumping to Babel 7, if you have plugins that depend on Babel 6, they will break.
The [Meteor 1.6.1 announcement](https://blog.meteor.com/announcing-meteor-1-6-1-50aad71da4e6) or [release notes](https://github.com/meteor/meteor/blob/master/History.md#v161-2018-01-19) are the best places to go for help debugging problems specific to Meteor introduced by this release. Additionally, you may want to check out Babel's own guide on [Upgrading to Babel 7](https://babeljs.io/blog/2017/03/01/upgrade-to-babel-7) or [Planning for Babel 7](https://babeljs.io/blog/2017/09/12/planning-for-7.0)

**The biggest change in this release is that we're upgrading to Babel 7.**
```
"@babel/runtime": "7.0.0-beta.38",
```

and in our `dev-dependencies`
```
"@babel/cli": "7.0.0-beta.38",
"@babel/core": "7.0.0-beta.38",
"@babel/preset-react": "7.0.0-beta.38",
"babel-preset-meteor": "7.0.0-beta.38-1"

```

Our babel presets now looks like this:
```
"presets": []
```
Yes, we've removed `stage-2` and `env` from our presets. That's recommended as meteor now includes `babel-preset-meteor`

Please see the PR #3615 for even more detail on what has changed in the update to Meteor 1.6.1


## ESLint
This release introduces the following changes to our .eslintrc file

#### jsx-a11y
We've added the recommended set of rules for [jsx-a11y](https://www.npmjs.com/package/eslint-plugin-jsx-a11y).
Reaction has always maintained a commitment to accessibility and adding this rule set provides linting rules to help enforce Aria and a11y compliance.

```
"extends": [
  "plugin:jsx-a11y/recommended"
],
```

#### Base rule set
We've added the following base eslint rules. You can find their descriptions and examples of failing and passing code here: https://eslint.org/docs/rules/

```
"array-bracket-spacing": ["error", "never"],
"array-callback-return": ["error", { "allowImplicit": true }],
"arrow-body-style": ["error", "as-needed", { "requireReturnForObjectLiteral": false }],
"arrow-parens": [ "error", "always", { "requireForBlockBody": true }],
"no-await-in-loop": "error",
"no-bitwise": "error",
"no-case-declarations": "error",
"no-confusing-arrow": ["error", { "allowParens": true }],
"no-empty-pattern": "error",
"no-lonely-if": "error",
"no-mixed-operators": ["error", {
  "groups": [
    ["%", "**"],
    ["%", "+"],
    ["%", "-"],
    ["%", "*"],
    ["%", "/"],
    ["**", "+"],
    ["**", "-"],
    ["**", "*"],
    ["**", "/"],
    ["&", "|", "^", "~", "<<", ">>", ">>>"],
    ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
    ["&&", "||"],
    ["in", "instanceof"]
  ],
  "allowSamePrecedence": false
}],
"no-multi-assign": ["error"],
"no-multi-spaces": ["error", { "ignoreEOLComments": false }],
"no-plusplus": "error",
"no-prototype-builtins": "error",
"no-tabs": "error",
"no-undef-init": "error",
"no-unneeded-ternary": ["error", { "defaultAssignment": false }],
"no-unsafe-finally": "error",
"no-useless-computed-key": "error",
"no-useless-concat": "error",
"no-useless-constructor": "error",
"no-useless-escape": "error",
"no-void": "error",
"object-curly-newline": ["error", { "ObjectExpression": { "multiline": true, "consistent": true }, "ObjectPattern": { "multiline": true, "consistent": true } }],
"object-property-newline": ["error", { "allowAllPropertiesOnSameLine": true }],
"operator-assignment": ["error", "always"],
"prefer-destructuring": ["error", {
  "VariableDeclarator": {
    "array": false,
    "object": true
  },
  "AssignmentExpression": {
    "array": true,
    "object": true
  }
}, {
  "enforceForRenamedProperties": false
}],
"prefer-rest-params": "error",
"prefer-spread": "error",
"prefer-template": "error",
"rest-spread-spacing": ["error", "never"],
```

## Collection Hooks
We've removed the Collection Hooks package. This may be a breaking change if you're relying on Collection Hooks in your plugins. You can follow our examples to remove the Collection Hooks dependencies from your plugins or (not recommended) you can install the collection hooks meteor package back into your application without error.

#### We've replaced Accounts and Revisions Collection Hooks in #3642
- Replaced all Account & Revision .before, .after collection hooks to use Hooks.Events API.
- Updated Revisons.after.update(callback) to be Hooks.Events.add("afterRevisionUpdate", callback) and added Hooks.Events.run("afterRevisionUpdate", userId, revision) after every Revisons.update(...) call.
- Updated Accounts.after.insert(callback) to be Hooks.Events.add("afterAccountsInsert", callback) and added a Hooks.Events.run("afterAccountsInsert", userId, user) after every Accounts.insert(...) call.
- Updated Accounts.after.remove(callback) to be Hooks.Events.add("afterAccountsRemove", callback) and added a Hooks.Events.run("afterAccountsRemove", userId, user) after every
Accounts.remove(...) call.
- Updated Accounts.after.update(callback) to be Hooks.Events.add("afterAccountsUpdate", callback) and added a Hooks.Events.run("afterAccountsUpdate", userId, user) after every Accounts.update(...) call.
- Removed .direct from any Accounts or Revisions collection calls


## Breaking Changes
There are potentially breaking changes you should be aware of in this release.
  - (breaking, feat) CoreLayout should probe for React component as fallback (#3524) .. Resolves #3523
    A plugin which has named React components identically to Blaze templates in core may no longer work.
  - (breaking, refactor) Remove unnecessary code in Media subscription. (#3558) .. Resolves #3548
    We've renamed the `Media` subscription located in `client/modules/core/subscriptions.js`. This subscription's content has not changed, but is now more aptly named `BrandAssets`. This will only cause problems if you were subscribing to the `Media` publication seprately in your plugin.
  - (fix): remove "admin" permission from shop manager role (#3505) .. Resolves #3541
    We've removed the `admin` role from the default role set that is granted to the Shop Manager group. This should not affect any existing shops, but if you have plugins or users that rely on the `admin` role being granted to the Shop Manager group you may need to update your plugins.
  - (refactor): replace imagemagick with sharp (#3631) .. Resolves #3482
    This is only a breaking change if you have a plugin that depends on `gm`. It should be trivial to replace with `sharp` and this PR serves as an example of how to do so.
    Replace GraphicMagick/ImageMagick with sharp and remove dependency on `gm`
    Add sharp to the project and dynamically loads where necessary
    Update image transforms to to use the sharp() functions.
    Refactor the "Media" FS.Collection to map the image transforms through a buildGFS() function to create each FS.Store.GridFS collection.
  - (refactor): dynamically import moment.js (#3602) .. Resolves #2635
    Provides `withMoment` HOC to wrap components that use moment.
    May cause breaking changes if you relied on any of the following Blaze templates or helpers which are no longer used in core:
    Remove `timezoneOptions` Blaze template helper from `client/modules/core/helpers/templates.js`, as it's no longer used in any core files.
    Remove `ordersList`, `orderPage/details` and `orderPage` Blaze templates, which were replaced by React templates
    Move `dateFormat` Blaze template helper out of the global helpers, and into a specific template helper, since it's only used in one place
  - Babel 7 / Meteor 1.6.1 update mentioned in detail at the beginning of these release notes.

### Dependency Update
- (chore): update node dependencies (#3630)
  - Updates the following npm packages by a major version number: `babel-jest`, `jest`, `libphonenumber-js`
  - Updates the following npm packages bya minor version number: `authorize-net`, `autoprefixer`, `babel-eslint`, `braintree`, `core-js`, `enzyme-to-json`, `enzyme`, `eslint-plugin-react`, `i18next`, `moment`, `nexmo`, `nock`, `node-loggly-bulk`, `paypal-rest-sdk`, `postcss`, `radium`, `react-dropzone`, `react-image-magnify`, `react-onclickoutside`, `react-select`, `react-table`, `react-tether`, `shopify-api-node`, `stripe`, `sweetalert2`, `swiper`, `twilio`, `velocity-animate`

### React Conversion
- We've converted the Avalara Setting page to React (see #3348)

### Refactor
  - (refactor): upgrade Meteor to 1.6.1 (#3615) .. Resolves #3029
  - (refactor): eslint-9 and Aria (#3582) .. Resolves #3574
  - (refactor): Enable eslint prefer-destructuring (#3610) .. Resolves #3573
  - (refactor): Fix warnings after turning on eslint prefer-destructuring (#3598) .. Resolves #3573
  - (refactor): eslint rule updates (1) (#3578) .. Resolves #3566
  - (refactor): eslint errors (#3604) .. Resolves #3570
  - (refactor): eslint rules 4 (#3599) .. Resolve #3569
  - (refactor): fix eslint and ARIA issues for notifications (#3593) .. Resolves #3574
  - (refactor): Deprecate meteor sAlert version (#3620) .. Resolves #3550
  - (refactor): import Reaction from /client|server|lib/api when possible (#3611) .. Resolves unreported issue
  - (refactor): remove theme editor (#3614) .. Resolves #2468
  - (refactor): remove meteor-collection-hooks dependency for orders (#3639) .. Resolves #3632
  - (refactor): 3636 nnnnat accounts revisions hooks events (#3642)
  - (refactor): remove TranslationProvider from lower level components (#3661)
  - (refactor): Converting Avalara Setting page to React (#3348)
  - (refactor): Dynamically import moment.js (#3602)
  - (refactor): replace imagemagick with Sharp (#3631) .. Resolves #3482
  - (refactor): removed analytics plugin (#3814) .. Resolves #2301
  - (refactor): use Events.Hooks instead of meteor collection hooks for cart events that trigger discount calculations (#3647)
  - (refactor): replace vsivsi:job-collection for npm module @reactioncommerce/job-queue (#3641) .. Resolves #3551
  - (refactor): nnnnat dynamic transliteration (#3749) .. Resolves #2634


### Style
  - Add CSS class to generic product fields (#3609) .. Resolves #3608

### Fixes
  - (fix): Undefined property: Reaction.Router.current().queryParam (#3384) .. Resolves #3496
  - (fix): Cart image & Remove cart icon alignment fixes (#3740)
  - (fix): Test Shopify credentials before saving. (#3468) .. Resolves #3371
  - (fix): Accounts admin: Check for return value of modal dialog. (#3659)
  - (fix): Display orderId instead of cartId (#3726) .. Resolves #3709
  - (fix): Marketplace - allow users to become sellers (#3725) .. Resolves #3617
  - (fix): substitute "-" for "/" when tagging docker image (#3739)
  - (fix): Zip is optional (#3738) .. Resolves #3530
  - (fix): Prevent mobile views having elements that are being cut off. (#3737)
  - (fix): Added css to make OR visible (#3736) .. Resolves #3293
  - (fix): Css to make whole title clickable (#3735) .. Resolves #3487
  - (fix): Added space to Taxcloud notice (#3722) .. Resolves #3720
  - (fix): shopify sync (#3663) .. Resolves #3502
  - (fix): restore remove from cart functionality (#3657)
  - (fix): Add missing address2 details (#3643)
  - (fix): Cannot complete checkout on second visit when using Anonymous user (#3640)
  - (fix): Fulfilling part of a multi-merchant order removes other parts of order (#3358) .. Resolves #3354
  - (fix): update action view size handling to fix shipping settings cutoff (#3759) .. Resolves #3396
  - (fix): Audit Product Images and update to always use optimized versions (#3730) .. Resolves #3637
  - (fix): Product url should open product detail page when user clicks on an item in the cart drawer (#3758) .. Resolves #3660
  - (fix): error when creating/update groups and/or group permissions for non-admin user (#3665) .. Resolves #3638
  - (fix): PDP placeholde image display (#3812)
  - (fix): handle invalid card details with Authorize.net (#3538) .. Resolves #3519
  - (fix): can't change localization values (#3817) .. Resolves #3811
  - (fix): shippo calculation error (#3774)
  - (fix): Add permission checks to template method and publication (#3606)
  - (fix): added currency formatting (#3808) .. Resolves #2286
  - (fix): PDP placeholde image display (#3812)
  - (fix): Sending the text to G+ (#3790) .. Resolves #2292
  - (fix): Edit address when already present (#3788) .. Resolves #3784
  - (fix): NavBar made only once (#3779) .. Resolves #3761
  - (fix): Add css to truncate (#3746) .. Resolves 3499:
  - (fix): Checking for shipping address and billing address (#3771) .. Resolves #3766
  - (fix): remove spinner before mounting (#3806) .. Resolves #3805
  - (fix): Don't use `default` for moment in invoice (#3816) .. Resolves #3815
  - (fix): Remove methods deprecated in 1.5 (#3744) .. Resolves #2882
  - (fix): handle invalid card details with Authorize.net (#3538) .. Resolves #3519
  - (fix): error when creating/update groups and/or group permissions for non-admin user (#3665)
  - (fix): Product url should open product detail page when user clicks on an item in the cart drawer (#3758)
  - (fix): error when switching table layout in order dashboard (#3773)
  - (fix): mobile subnav (#3775) .. Resolves #3679

### Chores
  - (chore): Build Docker image, tag, and push for every branch (#3629) .. Part of #2858
    Updates our CI build process to build and tag docker images on every push to github.
    We are now tagging docker images with the `SHA1`, the `git-branch-name`, any `git tags` and tagging `latest` if there is a push to Master with the latest tag. You can see all of tagged docker images on our docker hub. https://hub.docker.com/r/reactioncommerce/reaction/tags/
  - (chore): Add sentence to pull request template requesting images for UIX PRs (#3741)
  - (chore): Update pull request template (#3687)
  - (chore): update node dependencies (#3630)
  - (chore): New build step "Asset Provisioning" (#3335)
  - (chore): Remove methods deprecated in 1.5 (#3744)
  - (chore): update README.md links to issue tags and Contributing Guide (#3700)
  - (chore): add link to Contributing Guide in docs (#3688)


### Performance
  - (perf): dynamically import DayPickerRangeController (#3622) .. Part of #3621
  - (perf): remove kadira:dochead meteor package and add needed functions to a core plugin (#3625) .. Resolves #3548
  - (perf): flatten startup code and speed up translation import (#3592)
  - (perf): Don't rerender on failed sign in, (#3664)
  - (perf): User prefs stored in Accounts (#3463) .. Resolves #3404
  - (perf): dynamically load transliteration (#3749) .. Resolves #2634
  - (perf): remove meteor and babel-preset-react from babel presets (#3800)

### I18n
  - (i18n): Updated French translations (#3713)
  - (i18n): Changed all instances of 'shoify' to Shopify (#3723) .. Resolves #3712
  - (i18n): Update en.json (#3787)

## Contributors
Thanks to @thetre97, @loanlaux, @wackywombaat12 and @codejockie for contributing to this release

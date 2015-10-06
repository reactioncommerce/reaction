# Variables
## Globals
_core/common/packageGlobals.js:_

```javascript
// exported, global/window scope
ReactionCore = {};
ReactionCore.Schemas = {}; // Schemas defined in common/schemas
ReactionCore.Collections = {}; //Collections defined in common/collections
ReactionCore.Helpers = {}; //Misc.helpers defined in common/helpers
ReactionCore.MetaData = {}; // SEO, Metadata object
ReactionCore.Locale = {}; //i18n translation object
ReactionCore.Log = {}; // Logger instantiation (server)
```

_core/common/collections/products.js:_

```javascript
ReactionCore.Collections.Product = new Mongo.Collection("Product");
# etc...
```

The `reaction-core` package exports `ReactionCore`, on both client and server:

```javascript
api.export(["ReactionCore"]);
```

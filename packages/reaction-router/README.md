Router for Reaction Commerce

```
meteor add reactioncommerce:reaction-router
```

This package provides a routing package wrapped for ReactionCommerce.

Goals:
- migrate from iron:router to flow-router
- smooth transitions
- Reaction packages use the ReactionRegistry to declare routes.
- Wrap as Router as "ReactionRouter"

Future: Potentially support iron-router and flow-router with a layer like: [https://github.com/nicolaslopezj/meteor-router-layer](https://github.com/nicolaslopezj/meteor-router-layer)

# Helpers
## pathFor
alias: `pathForSEO`

```
{{pathFor 'product' handle=_id variantId=variants._id}}
```

Result: `/product/P4hP8ZcFP9rDDEMpa/CJoRBm9vRrorc9mxZ`

## urlFor
Absolute path

```
{{urlFor 'product' handle=_id variant=variants._id}}
```

Result: `http://localhost:3000/product/P4hP8ZcFP9rDDEMpa/CJoRBm9vRrorc9mxZ`

## active
General helper to return "active" when on current path alias:  `currentRoute`

```
<li class="{{active name}}">
  <a class="dashboard-navbar-package" data-package="{{name}}" title="{{name}}">
    {{label}}
  </a>
</li>
```

Return "active" or null.

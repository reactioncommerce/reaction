# Email Templates
A basic collection of Reaction email templates.

```
meteor add reactioncommerce:reaction-email-templates
```

Provides functionality to load local default email templates, or optionally load from the `Templates` collection.

Typical use of the exported `ReactionEmailTemplate`:

```js
SSR.compileTemplate("<template>", ReactionEmailTemplate("<template>"));
try {
  return Email.send({
    to: email,
    from: `${shop.name} <${shop.emails[0].address}>`,
    subject: `${shop.name} Update`,
    html: SSR.render("<template>", {
      homepage: Meteor.absoluteUrl(),
      shop: shop,
      order: order,
      shipment: shipment
    })
  });
```

## SSR
This package includes  `meteorhacks:ssr` which provides Server Side Rendering of templates.

`meteorhacks:ssr` is implied and exports `SSR`.

## Templates
Templates are located in `reaction-email-templates/templates` and are named either after a workflow status, or a method that triggers their load.

Templates can be defined in the `Shops.layout` and `Templates` collections, this collection can be used for customization of the default template collections, or to provide additional templates.

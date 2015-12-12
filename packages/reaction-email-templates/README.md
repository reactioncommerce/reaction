# Reaction Email Templates
A basic collection of email templates.

```
meteor add reactioncommerce:reaction-email-templates
```

Example of the implementation of templates from this package:

```js
SSR.compileTemplate("itemsShipped", ReactionEmailTemplate("templates/orders/itemsShipped.html"));
try {
  return Email.send({
    to: email,
    from: `email account <${shop.emails[0].address}>`,
    subject: `A special message from from ${shop.name}`,
    html: SSR.render("itemsShipped", {
      homepage: Meteor.absoluteUrl(),
      shop: shop,
      order: order,
      shipment: shipment
    })
  });
```

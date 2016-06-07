# Email Templates
A basic collection of Reaction email templates.

```
meteor add reactioncommerce:reaction-email-templates
```

Provides functionality to load local default email templates, or optionally load from the `Templates` collection.

Typical use of ReactionEmailFromTemplate :

```js
const html = ReactionEmailFromTemplate(
  "accounts/inviteShopMember",
  user.profile.language,
  {
    homepage: Meteor.absoluteUrl(),
    shop: shop,
    currentUserName: currentUserName,
    invitedUserName: name,
    url: Accounts.urls.enrollAccount(token)
  }
);

try {
  return Email.send({
    to: email,
    from: `${shop.name} <${shop.emails[0].address}>`,
    subject: `You have been invited to join ${shop.name}`,
    html: html
  });
} catch (error) {
  throw new Meteor.Error(403, "Unable to send invitation email.");
}
```

## SSR
This package includes  `meteorhacks:ssr` which provides Server Side Rendering of templates.

`meteorhacks:ssr` is implied and exports `SSR`.

## Templates
Templates are located in `reaction-email-templates/templates` and are named either after a workflow status, or a method that triggers their load.

Templates can be defined in the `Shops.layout` and `Templates` collections, this collection can be used for customization of the default template collections, or to provide additional templates.

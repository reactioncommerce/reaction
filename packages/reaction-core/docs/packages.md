#Package Development

To develop packages, and see your changes update in your local installation you must *git clone* packages locally, either into reaction/packages, or with
a symbolic link to the package checkout.

```bash
    cd reaction
    ln -s <full path to package>  packages/
```

For example:

```bash
  mkdir ~/reactioncommerce
  cd ~/reactioncommerce
  git clone https://github.com/reactioncommerce/reaction.git
  git clone https://github.com/reactioncommerce/reaction-core.git
  git clone https://github.com/reactioncommerce/reaction-core-theme.git
  ln -s ~/reactioncommerce/reaction-core reaction/packages/reaction-core
  ln -s ~/reactioncommerce/reaction-core-theme reaction/packages/reaction-core-theme
```

It's a little more work, but it's a good idea to make sure you are in the `development` branches, and clone (installed) Reaction packages to ensure you're working with a complete development enviroment.

*Note: Pull requests are happily accepted, please make your GitHub pull request a merge to the `development` branch, and not master.*

*Tip: Copy the settings/dev.sample.json to settings/settings.json and edit the file to retain configuration settings such as admin user credentials and paypal authentication between `meteor reset`. Start with `meteor --settings settings/settings.json`*

# Create packages

    meteor create --package

See [Meteor docs](http://docs.meteor.com/#/full/writingpackages) for additional help creating packages.

###package.js
Once you have created your added, cloned, or symlinked your package development folder to the `reaction/packages` directory, you'll continue creating a standard Meteor package by defining `package.js`, starting with a describe block:

```javascript

Package.describe({
  summary: "Reaction Hello World - example package for Reaction",
  name: "reactioncommerce:reaction-helloworld",
  version: "0.1.0",
  git: "https://github.com/reactioncommerce/reaction-helloworld.git"
});

Package.onUse(function (api, where) {
  api.use("reactioncommerce:core@0.4.1"); //current release
  api.addFiles("server/register.coffee",'server');
});
```

Where name is the `org-user:packagename` that you will use to publish this package to the Meteor registry. See: [Meteor package.js docs](http://docs.meteor.com/#/full/packagejs).

Any files you create in your package you will need to add in your [package.js](http://docs.meteor.com/#/full/packagejs) file.

```javascript
api.addFiles('myfile');
```


To test your package, add it to your application :

    meteor add your-new-package

*Tip: You can also add and remove packages by editing `.meteor/packages`*

###Publishing

You can develop and even privately deploy with your packages in the `reaction/packages` directory. If you'd like to publically share the package, you'll need to publish it to the Meteor package registry.

To have your package included in a release, please create a GitHub issue.

See [meteor publish](http://docs.meteor.com/#/full/meteorpublish) for details on publishing to the Meteor package registry.

*We can fork and publish packages under the reactioncommerce organization if the packages are included, and a pull request is made in reaction-core or reaction application distribution.*

##ReactionCore.registerPackage
To integrate a package into the rest of Reaction Commerce use
`ReactionCore.registerPackage` to describes package details
and provide some common integration hooks.

Integrate packages with reaction-core by adding **server/register.coffee**

```coffeescript
ReactionCore.registerPackage
  name: 'reaction-paypal' # usually same as meteor package
  autoEnable: false # auto-enable in dashboard,transforms to enabled
  settings: # private package settings config (blackbox)
    mode: false
    client_id: ''
    client_secret: ''
  registry: [
    # all options except route and template
    # are used to describe the
    # dashboard 'app card'.
    {
      provides: 'dashboard'
      label: 'PayPal'
      description: 'Accept PayPal payments'
      icon: 'fa fa-paypal'
      cycle: 3
      container: 'paypal'
    }
    # configures settings link for app card
    # use 'group' to link to dashboard card
    {
      route: 'paypal'
      provides: 'settings'
      container: 'paypal'
    }
    # configures template for checkout
    # paymentMethod dynamic template
    {
      template: 'paypalPaymentForm'
      provides: 'paymentMethod'
    }
  ]
  # array of permission objects
  permissions: [
    {
      label: 'Pay Pal'
      permission: 'dashboard/payments'
      group: 'Shop Settings'
    }
  ]

```


###Package
 ```
 name: '<typically same as package name>'
 autoEnable: '<true/false automatically enable in dashboard>'
 settings:
      <Object:blackbox default properties for service configuration.>
 ```

###Registry
The registry is used to define routes, dynamic templates, and some package UI handling.

A registry object can be any combination of properties, with `provides` being the only required property.

**Current dynamic template types:**

 * widget
 * paymentMethod
 * shippingMethod
 * settings
 * shortcut
 * dashboard
 * console

For example, to add a new dashboard widget:

```
    # order widgets
    {
      template: "coreOrderWidgets"
      provides: 'widget'
    }
```


From template you can use the `reactionApps` helper to load registry objects.

```html
  {{#each reactionApps provides="settings" name=name group=group}}
    <a href="{{pathFor route}}" class="pkg-settings" title="{{i18n 'app.settings'}}">
      <i class="{{orElse icon 'fa fa-cog fa-2x fa-fw'}}"></i>
    </a>
  {{/each}}
```

You may filter, or define using any of the optional registry properties:

**package**
  * name
  * enabled
 
**registry**
  - provides
  - route
  - template
  - icon
  - label
  - cycle
  - container

***Special Usage***
 - `cycle`  1- Core, 2- Stable, 3- Testing 4- Early
 - `container` group alike for presentation *example: used to connect settings on dashboard app card registry object*

You can also extend or replace any core template using [template extensions](https://github.com/aldeed/meteor-template-extension/).

**Widgets**

Add widgets to your package to be included on the `dashboard console` by including a registry entry and a template that provides 'widget'.

    <template name="reactionHelloworldWidget">
        <div class="dashboard-widget">
          <div class="dashboard-widget-center">
            <div>
              <h3 class="helloworld-text">Widget Panel</h3><small>your widget</small>
            </div>
          </div>
        </div>
    </template>

*See example: packages/reaction-core/client/templates/dashboard/orders/widget/widget.html*

*Tip: the `dashboard-widget` and `dashboard-widget-center` classes will create touch/swipeable widget boxes.*

Include in **server/register.coffee** registry:

```
    # order widgets
    {
      template: "reactionHelloworldWidget"
      provides: 'widget'
    }
```

###Permissions

We use [alanning:roles](https://github.com/alanning/meteor-roles) for providing roles support.

Users with "admin" role are full-permission, site-wide users. Package specific roles can be defined in `register.coffee`.

Adding permissions to routes with:

```coffeescript
{
  label: '<permission label, ie: "Pay Pal Admin">'
  permission: '<route granted permission>'
  group: '<grouping in user admin panel, usually "Shop Settings">'
}
```


**Using Permissions**

Shop has owner, which is determined by the "ownerId" field in the Shop collection.

**To check if user has owner access:**

on client: for current user

    ReactionCore.hasOwnerAccess()

on server: for some shop (current if not defined) and some userId (current if not defined)

    ReactionCore.hasOwnerAccess(shop, userId)

in templates: for current user

    {{#if hasOwnerAccess}}{{/if}}

**Shop has members, which can be admin and have permissions**

If member is admin next methods will always return `true`

To check if user has some specific permissions:

on Client: for current user, where "permissions" is string or [string]

    ReactionCore.hasPermission(permissions)

on Server: for some shop (current if not defined) and some userId (current if not defined), where "permissions" is string or [string]

    ReactionCore.hasPermission(permissions, shop, userId)

in templates:

    {{#if hasShopPermission permissions}}{{/if}}


For using shop permissions in some packages you must add it into register directive.
If we add this package then permissions will be available in Shop Accounts Settings.

Another example:

    ReactionCore.Packages.register
     name: 'reaction-commerce-orders'
     provides: ['orderManager']
     permissions: [
       {
         label: "Orders"
         permission: "dashboard/orders"
         group: "Shop Management"
       }
     ]


##Routes
We use the [iron:router](https://github.com/iron-meteor/iron-router) package for managing routes.
Routes are created in `common/routing.coffee`

```
Router.map ->
  @route 'paypal',
    controller: ShopAdminController
    path: 'dashboard/settings/paypal',
    template: 'paypal'
    waitOn: ->
      return ReactionCore.Subscriptions.Packages
```

Use the controller `ShopController` for public/shop routes, and `ShopAdminController` for admin roles.

Define this route and template in the `ReactionCore.registerPackage` to export this route to ReactionCore.

##Collections
We use the [AutoForm, collection2, simple-schema](https://github.com/aldeed/meteor-autoform) package for defining forms, collections and schemas.

You can extend core collections, schemas in your package. You can also create your own collections.

Example of extending a core schema:

```
ReactionCore.Schemas.BraintreePackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig
  {
    "settings.mode":
      type: Boolean
      defaultValue: false
    "settings.merchant_id":
      type: String
      label: "Merchant ID"
    "settings.public_key":
      type: String
      label: "Public Key"
    "settings.private_key":
      type: String
      label: "Private Key"
  }
])
```



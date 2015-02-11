#Package Development

#Core packages
To work on included packages, and see your changes update in your local installation you must *git clone* packages locally, then in your local checkout of the *reactioncommerce/reaction* repo link the package to your checkout.

```bash
    ln -s <full path to package>  packages/<org_pkgname>
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

*Note: Pull requests are happily accepted, please make your GitHub pull request a merge to the `development` branch, and not master.*

*Tip: Copy the settings/dev.sample.json to settings/settings.json and edit the file to retain configuration settings such as admin user credentials and paypal authentication between `meteor reset`. Start with `meteor --settings settings/settings.json`*

# New packages

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
  api.use("reactioncommerce:core@0.3.0");
  api.add_files("common/register.coffee");
});
```

Where name is the `org-user:packagename` that you will use to publish this package to the Meteor registry. See: [Meteor package.js docs](http://docs.meteor.com/#/full/packagejs).

To test your package, add it to your application :

    meteor add your-new-package

*Tip: You can also add and remove packages by editing `.meteor/packages`*

###Development

You can develop and even privately deploy with your packages in the `reaction/packages` directory. If you'd like to publically share the package, you'll need to publish it to the Meteor package registry.

###Publishing
To have your package included in a release, please create a GitHub issue.

See [meteor publish](http://docs.meteor.com/#/full/meteorpublish) for details on publishing to the Meteor package registry.

*We will fork and publish packages under the reactioncommerce organization if the packages are included, and a pull request is made in reaction-core or reaction application distribution.*

##ReactionCore.registerPackage
To integrate a package into the rest of Reaction Commerce use
`ReactionCore.registerPackage` which describes package details
and provides some common integration hooks.

Integrate packages with reaction-core by adding **common/register.coffee**

```coffeescript
ReactionCore.registerPackage
  name: 'reactioncommerce:reaction-paypal'
  provides: [ 'paymentMethod' ]
  settings:
    mode: false
    client_id: ''
    client_secret: ''
  dashboard:
    label: 'PayPal'
    description: 'Accept PayPal payments'
    icon: 'fa fa-paypal'
    priority: '2'
    autoEnable: false
  templates: [
    {
      template: 'paypalPaymentForm'
      provides: 'paymentMethod'
    }
    {
      template: 'paypal'
      provides: 'settings'
      route: 'paypal'
    }
    {
      template: 'super-cool-widget'
      provides: 'widget'
    }
  ]
  permissions: [
    {
      label: 'Pay Pal'
      permission: 'dashboard/payments'
      group: 'Shop Settings'
    }
  ]
```

*Note: any files you create in your package you will need to add in your [package.js](http://docs.meteor.com/#/full/packagejs) file.*

```javascript
api.addFiles('common/register.coffee');
```

###Package
 ```
 name: '<typically same as package name>'
 provides: '<an array of methods this package provides>'
 ```

###Settings
  Object with default properties for service configuration.

###Dashboard
Control the default `Reaction Apps` dashboard content.

```
  label: '<one-two word title>'
  description: '<short summary>''
  icon: '<font awesome or glyphicon class>'
  autoEnable: <true if we want this to be enabled by default when added>
```

###Templates
Define template(s) that will be loaded by a [dynamic template](http://docs.meteor.com/#/full/template_dynamic) that matches value of `provides`.

**Current dynamic template types:**

 * widget
 * paymentMethod
 * shippingMethod
 * settings

You can have as many of each template type as you need.

You can also extend or replace any core template using [template extensions](https://github.com/aldeed/meteor-template-extension/).

**Widgets**

Add widgets to your package to be included on the `dashboard console` by including a template that provides 'widget'.

    <template name="reaction-helloworld-widget">
        <div class="dashboard-widget">
          <div class="dashboard-widget-center">
            <div>
              <h3 class="helloworld-text">Widget Panel</h3><small>See: client/dashboard/widgets</small>
            </div>
          </div>
        </div>
    </template>


*Tip: the dashboard-widget and dashboard-widget-center classes will create touch/swipeable widget boxes.*

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

** Using Permissions **

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
     label: 'Orders'
     overviewRoute: 'shop/orders'
     hasWidget: false
     permissions: [
       {
         label: "Orders"
         permission: "dashboard/orders"
         group: "Shop Management"
       }
     ]

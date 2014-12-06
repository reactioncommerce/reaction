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
  ln -s ~/reactioncommerec/reaction-core reaction/packages/reaction-core
  ln -s ~/reactioncommerce/reaction-core reaction/packages/reaction-core-theme
```

*Note: Pull requests are happily accepted, please make your GitHub pull request a merge to the next development release branch (as indicated on `reactioncommerce/reaction`, and not master.*

*Tip: Copy the settings/dev.sample.json to settings/settings.json and edit the file to retain settins between `meteor reset`. Start with `meteor --settings settings/settings.json`*

# New packages

    meteor create --package

See [Meteor docs](http://docs.meteor.com/#meteorcreate) for additional help creating local packages.

Once you have created your packages directory, you'll continue creating a standard Meteor package by defining `package.js`, starting with a describe block:

```
  Package.describe({
    summary: "Reaction Hello World - example package for Reaction",
    name: "reactioncommerce:reaction-helloworld",
    version: "0.1.3",
    git: "https://github.com/reactioncommerce/reaction-helloworld.git"
  });
```

Where name is the `org-user/packagename` that you can use to publish this to the Meteor package registry using [meteor publish](http://docs.meteor.com/#meteorpublish)

To use in the local application, the final step is add to your local app:

    meteor add your-new-package

*Tip* You can also just edit `.meteor/packages`

For a more thorough review of Meteor packages, [the meteor hackpad unipackage doc](https://meteor.hackpad.com/Unipackage-tvas8pXYMOW#:h=Using-Packages-in-Your-App) has a lot of useful information.

##Dashboard
Once you have a working package, you'll want to integrate it into the rest of Reaction Commerce.  

Add packages to the reaction dashboard by adding **common/register.coffee**

    ReactionCore.registerPackage
      name: "reaction-helloworld"
      depends: [] #reaction packages
      label: "HelloWorld"
      description: "Example Reaction Package"
      icon: "fa fa-globe"
      priority: "2"
      overviewRoute: 'helloworld'
      hasWidget: true
      shopPermissions: [
        {
          label: "HelloWorld"
          permission: "/helloworld"
          group: "Hello World"
        }

There are three elements to the "dashboard" view for packages.

- Package Panel: the left most box in the dashboard panel
- Package Widgets: - this is everything to the right of the panel and would be typical a group of graphs,etc
- Package Page: the area below the dashboard navigation bar, which can be used any content
 

Add widgets to your package to be included on the dashboard by including a template named packagename-widget

    <template name="reaction-helloworld-widget">
        <div class="dashboard-widget">
          <div class="dashboard-widget-center">
            <div>
              <h3 class="helloworld-text">Widget Panel</h3><small>See: client/dashboard/widgets</small>
            </div>
          </div>
        </div>
    </template>

Tip: the dashboard-widget and dashboard-widget-center classes will create touch/swipeable widget boxes.

##Roles/Permissions System

###Roles
We use https://github.com/alanning/meteor-roles for providing roles.
Users with "admin" role are full-permission, site-wide users. Package specific roles can be defined in register.coffee

###Permissions
Shop has owner, which determine by "ownerId" field in Shop collection.

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


For using shop permissions into some packages you must add it into register directive.
If we add this package then permissions will be available in Shop Accounts Settings.

    ReactionCore.Packages.register
     name: 'reaction-commerce-orders'
     provides: ['orderManager']
     label: 'Orders'
     overviewRoute: 'shop/orders'
     hasWidget: false
     shopPermissions: [
       {
         label: "Orders"
         permission: "dashboard/orders"
         group: "Shop Management"
       }
     ]

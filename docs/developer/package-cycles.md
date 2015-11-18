Package authors should choose a support path for their packages, and use the "cycle" key in the package registry to indicate the kind of support the package will have.

**Core**

Transfer repository to reactioncommerce organization.

You can transfer the package repo to the Reaction Commerce Github organization (where you'll be given admin rights to the repo). Do this if you would prefer to not to be solely responsible for ongoing updates and compatibility maintenance. We'll adopt these packages as our own, and should be considered the most stable packages, and will be identified as **Core** packages.   Packages of this type should also provide reasonable integration testing coverage. Security tests on publications and methods are required. Must include continuous integration config file. 

Core packages should be reliable for use as dependencies by other packages.

Any documentation blocks should contain your organization and author information, while if you need to document a maintainer, you can use `Reaction Commerce <maintainer at reactioncommerce.org>`.

In the package registry, packages of this type should be configured cycle:1. `Cycle` is a reference to a software lifecycle.

```
 cycle: 1 // core
```

**Community**

We can create a reactioncommerce org **community fork** of your package repo, and maintain a supported fork that we publish as a `reactioncommerce:*` package. These packages may be included in the default `.meteor/packages` file for Reaction.  Packages of this type should be configured as `Community` ,  `cycle: 2` in the package registry.   Ideally these packages have CI and some testing coverage.

**Public**

You want to manage all org, control and package publishing. You'll be responsible for compatibility updates and ensure that corresponding Atmosphere package updates are published for every major Reaction release to maintain compatibility.  Packages of this type should be configured as `Public` ,  `cycle: 3` in the package registry.

We'll do limited testing on these packages, so they will only be made available as optional packages that have to be manually added.

**Local** All other package types should be `cycle:4`.

**Licensing**

Reaction is GPL v3 licensed. Package licensing may be GPL v3 compatible licenses such as GPL v3, MIT, APACHE v2.  

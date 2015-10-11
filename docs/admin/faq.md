# Frequently Asked Questions
## Is Reaction production ready?
We're currently in our Beta release. Our [Features page](https://reactioncommerce.com/features) outlines what we have in store for our Beta and future releases. Production readiness will depend on your individual use case and requirements. 

## What's your roadmap for Reaction?
Our [Features page](https://reactioncommerce.com/features) outlines our roadmap and plans for Reaction. And here's our [project board](https://waffle.io/reactioncommerce/reaction).

## Do you offer hosted shops?
Yes, we will offer hosted shops with the Beta release of our Platform as a Service (PaaS) in late 2015. Our Paas will give anyone the ability to launch Reaction shops. This will be an Early Access Beta Release of our PaaS solution for launching clusters of Docker-ized Reaction shops on a custom solution that we're developing that supports custom SSL certificates and domain names. Our vision is that you’ll be able to customize and extend, and then deploy your Reaction shops directly and conveniently on our platform.

## Is it possible for me to host a Reaction shop anywhere I want?
Yes. You can host a Reaction shop on any host/virtual machine container that supports Meteor/Node.js and MongoDB. Our code is fully open source on GitHub at [github.com/reactioncommerce/reaction](https://github.com/reactioncommerce/reaction).

## Do you support multiple languages?
Yes. We have [internationalization support](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/i18n.md) for numerous languages, and we support currency conversion and localized currency formats.

## What is the pricing/licensing model?
Reaction is currently free, and there will always be a free, open source version available. Eventually, we will offer premium plans with tiered pricing structures on the reactioncommerce.com platform. Our code is licensed under the GPL v3 license. The Terms & Conditions for shops hosted on our reactioncommerce.com platform can be found at [//reactioncommerce.com/legal](https://reactioncommerce.com/legal).

## Is MongoDB/NoSQL best suited for ecommerce?
We think so! We believe that the common SQL schema for legacy ecommerce platforms isn't just unnecessary; it's overkill. By rethinking the way the database is architected, there are numerous benefits of Mongo/NoSQL -- from speed to simplified code.

We enforce all of the typical joins, cascades, schemas, validation, etc., with functionality that we have included (collections, schemas, hooks, helpers). But instead of trying to join a bunch of stuff together, we simply have an object that is a product. There are huge advantages to this approach, such as speed + easy code + the schema can be easily modified to accommodate any data requirements. This is unlike legacy platforms and their use of the entity - attribute - value lookup that is so complex and slow. In fact, legacy platforms have tried to architect their way around these very real limitations of SQL that NoSQL easily handles (using EAV). By using NoSQL, we remove the very complex layer of looking up and joining attributes, and also the complexity of adding new field/values. (You just do it to the main object, and that's going to persist throughout the life of the object.)  We also don't have to deal with the continuous translation of database structure to a code object.

In reality, in our use, the DB is just the persistent storage of the JavaScript objects. For example, a product is a collection of variants (objects) like blue, green, etc., and are each their own object contained within a "product" object.

In localization (l10n), this can also mean different pricing, taxes, etc., for different regions, so pricing is at the variant level not at the product level.  This is even true with just one language when you have "Blue XXL" being more expensive than "Green XL."

## Have you tested Reaction on large shops with thousands of products?
We've done general performance testing and will be doing thorough testing as part of our Beta release.

We're building everything to be "ephemeral" in nature, so "cloud" scaling is the idea from the get-go. We believe scaling won't be the same set of issues as with legacy platforms where you have to jump through a ton of hoops to get rid of the dependancies on the server (file system, sessions, etc.).

Regardless, if it's Docker or other Virtual Machine (VM) containers, the idea is that the storefront itself should scale without issues. The bottleneck does become the database, but with sharding and lots of other solutions, we think that it's an easier problem to solve. We created Launch Dock as our project for the server-side/Docker launching. During our Alpha release, we did extensive tests deploying shops at scale and reviewing and testing different database scaling options.

## Reaction is an open source project, how can I get involved?
You can find step-by-step instructions for becoming a contributor here: [//blog.reactioncommerce.com/how-to-get-involved-with-reaction-commerce/](https://thoughts.reactioncommerce.com/how-to-get-involved-with-reaction-commerce/).

## The Reaction platform is reliant on JavaScript to run. Does that have a negative impact on SEO?
[Google now indexes JavaScript when crawling websites](https://googlewebmastercentral.blogspot.com.es/2014/05/understanding-web-pages-better.html).

Additionally, Reaction uses the Meteor spiderable package, which uses PhantomJS to render the static page version for search engines. You can read more about the Meteor spiderable package [here](https://docs.meteor.com/#spiderable), [here](https://www.meteorpedia.com/read/spiderable/), and [here](https://www.eventedmind.com/feed/meteor-the-spiderable-package). We currently have this disabled by default, as we are still heavily in development, but if a site needed spiderable, all that you need to do to enable is 'meteor add spiderable'.

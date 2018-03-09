# GraphQL Schemas

This directory holds the schemas for the Reaction GraphQL API.

For more information see http://graphql.org/learn/schema/

## Differences from SimpleSchema

The schema has been edited to be more GraphQL-like in spirit. We've also taken
the opportunity to do some cleanup to the schema. In these changes we will:

* Hydrate ID's to full objects to provide complete graph traversal.
* Hide server-side attributes that should not be exposed to the client.
* Alter attribute names to make things more consistent.
* Remove unused attributes.

Notes are placed on the schema to indicate these changes.

## JavaScript Wrapped Schema

The schema are currently wrapped in JavaScript files. This adds a small amount
of boilerplate to the code but `*.graphql` files are not included in Meteor
builds. Tools like `graphcool/graphql-import` won't work without modifying the
Meteor build to include them.

We may alter this in the future. Plugins do exist to add `.graphql` to the
build but they are published Atmosphere only.

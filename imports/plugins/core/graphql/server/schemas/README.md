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

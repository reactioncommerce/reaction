# Reaction primary key field


**Author(s):** @Ticean Bennett @Pete Lyons @Eric Dobbertin @Mike Murray @Ross Hadden

**Status:** Final


### Tickets

- [ ]  api-utils: Add method that accepts internal database ids as-is or an encoded opaque id [https://github.com/reactioncommerce/api-utils/issues/18](https://github.com/reactioncommerce/api-utils/issues/18)
- [ ]  reaction: Implement api-utils method that accepts internal database ids as-is or decodes an opaque id [https://github.com/reactioncommerce/reaction/issues/6116](https://github.com/reactioncommerce/reaction/issues/6116)
- [ ]  reaction: Add feature flag allowing `_id`, and other encoded id fields to be returned as their original database id values [https://github.com/reactioncommerce/reaction/issues/6115](https://github.com/reactioncommerce/reaction/issues/6115)

# Problem Description

We need to provide guidance for naming and populating the primary key fields for Reaction entities.

# Context

There is confusion over what fields should be used as the primary key for Reaction entities and how those IDs should be exposed to GraphQL.

This is a question that keeps coming up and separate teams are spending effort to resolve this. We’d like to come to a generally blessed approach that can be adopted by all teams, relieving them from this decision making. We’d also like a generally blessed approach we can document and have developers using our GraphQL API understand and code against consistently.

## Current Factors

There are several considerations that have made this a complicated decision.

1. The Reaction node app, our incumbent application, uses `_id` as the primary key in all MongoDB collections.
  1. The field name `_id` is reserved for use as a primary key in MongoDB; its value must be unique in the collection, is immutable, and may be of any type other than an array. [(Mongo documentation)](https://docs.mongodb.com/manual/core/document/#field-names)
  2. Anecdotally, that has been a common practice in Node/MongoDB
  3. Typically MongoDB `_id` is an [objectid](https://docs.mongodb.com/manual/reference/bson-types/#objectid) type which has many features including a timestamp, etc. Reaction uses a random string from a restricted character set.
  4. It’s possible to use another field as the identifier but that’s working against the grain (Ross)
  5. In Mongo the client has to generate the ID and provide to Mongo, which will verify that it is unique. (Pete) The client adapter can often generate the `_id`. This permits some offline (or client controlled) operations and later online synchronization.
2. Relay Compatibility. Relay expects the `id` field to be a globally unique key.
  1. Relay expects the `id` fields to be a globally unique key. ([Relay’s Global Object Identification Spec](https://facebook.github.io/relay/graphql/objectidentification.htm)) Relay also specs connections and pagination.
  2. This collides with the very common `id` field, present in many extant databases.
  3. [Relay suggests using another field for the ID.](https://github.com/facebook/relay/issues/191#issuecomment-136103831)
  4. They may be trying to get this into the GraphQL spec, but that’s not confirmed because of disagreements in the community over the specs. The Relay community doesn’t agree on any common convention that’s suitable to avoid conflicts.
3. Developer/User experience concerns around integers vs UUIDs vs opaqueIds
  1. uuid formatting can differ. it can be string format, with and without dashes; or in byte format.
  2. ids can come from other systems. this can cause confusion when users get different values on the same field.
  3. different ids on input operations (gql uuid, vs db identifier)
  4. Because we encode type information as a prefix before base64 encoding, all of our opaque ids start with the same set of characters (the base64 of “reaction/” which is “cmVhY3Rpb24v”). This has 2 devx issues
    1. It is not possible to scan a bunch of ids and determine easily “these are all the same” nor “these are all different”. The unique bits don’t start until the middle of the string, the end bits often have base64 padding equal signs
    2. base64 encoding is not within the URL-safe character (`=` becomes `%3D`)
4. Apollo uses a different approach (for caching)
  1. It combines the `__typename` with `id` or `_id` to create unique cache keys
  2. Thus it’s compatible with type-specific IDs
  3. It is fully customizable in code via `dataIdFromObject`
5. Reaction’s GraphQL uses an opaque, globally unique ID at `_id`
  1. Doesn’t match the Relay spec, which specifies the globally unique identifier at the `id` field.
  2. We don’t provide the database ID in a readable format to the client. Clients must manually decode the opaque id to get at the identifier used outside of GraphQL. [Facebook’s Relay team doesn’t regard this as a problem](https://github.com/facebook/relay/issues/191#issuecomment-136103831) and it’s unlikely to change in mainline Relay.
  3. The actual ID would be more useful to most users and clients.
  4. Relay may be forkable and customizable [with this PR](https://github.com/facebook/relay/pull/1258). It’s unclear if this was mainlined and if it requires a Relay fork. [Usage here?](https://github.com/artsy/metaphysics/commit/748e5e6be114277cdaf8d12fc7981ea6501b704a)
  5. Relay is an ecosystem for developers - The system that we integrate in e-commerce will expose IDs and expect them. They may be used for customer support, order reference, etc.
  6. Reaction aims to be flexible & compatible (service oriented approach)
  7. Acknowledge that we cannot always control fields and ID formats. We know of existing Reaction installation that require their identifiers to fit a specific format. Sometimes they must be sequential.

## ID Usages

We considered the areas in which the ID’s are used:

- GraphQL client querying and caching (Relay, Apollo Client, etc.)
- Primary keys in the data layer (MongoDB _id, PostgreSQL integer key, uuid, etc)
- Reference ID (We’ve seen these used by administrators and shoppers. They’re usually friendlier and used in URLs and filters.)
- External ID (Identifiers from another system. We’ve seen installs that use these to match records in ETL.)

## ID Data Type Options

We considered common identifier value types:

- Positive Integers
- ObjectId (mongo/bson, has timestamp)
- UUIDv1 (timestamp)
- UUIDv4 (random)
- cuid [https://usecuid.org/](https://usecuid.org/) (has timestamp, slug)
- Random String

## Links

Relay: [https://facebook.github.io/relay/graphql/objectidentification.htm](https://facebook.github.io/relay/graphql/objectidentification.htm)

Relay: [https://relay.dev/docs/en/graphql-server-specification.html#object-identification](https://relay.dev/docs/en/graphql-server-specification.html#object-identification)

GraphQL + Relay: [https://graphql.org/learn/global-object-identification/](https://graphql.org/learn/global-object-identification/)

Apollo Client: [https://www.apollographql.com/docs/react/caching/cache-configuration/#assigning-unique-identifiers](https://www.apollographql.com/docs/react/caching/cache-configuration/#assigning-unique-identifiers)

GraphQL specification: [http://spec.graphql.org/](http://spec.graphql.org/)

Issue and discussion: [https://github.com/facebook/relay/issues/1061](https://github.com/facebook/relay/issues/1061)

Issue and discussion: [https://github.com/facebook/relay/pull/1232](https://github.com/facebook/relay/pull/1232)

# Decision

Reaction is building a commerce system, therefore commerce is our primary problem domain. The commerce domain should take precedence over other incidental conflicts when they occur.

A factor that has made this particular decision difficult has been the demands of Relay, which is a development tool. In our early GraphQL implementation we tried to support Relay and follow “best practice” guides that were available at the time. We admit that we didn’t hit the mark. We don’t fully support Relay and we’re shadowing the `_id` field with a value that differs from our database. This has caused confusion with our development team and API users without providing tangible benefits.

We’re now deciding that the integrity of the domain data takes precedence over support for Relay. Reaction’s data passes through Kafka as well as GraphQL and other backend systems. We feel this decision reconciles field shadowing and simplifies the data in GraphQL and in backend systems.

## **Decision Details**

- We are dropping first class support, or attempted support, for Relay. We won’t try to reconcile conflicts between Relay’s demands and the data of the system. We may document how to configure Relay to use a custom node ID field:
  - [Apollo makes custom identifiers easy](https://www.apollographql.com/docs/react/caching/cache-configuration/#custom-identifiers)
  - [Relay requires a fork, but isolates the configuration](https://github.com/facebook/relay/pull/1232)
  - [The Graphene Python client is configurable](https://docs.graphene-python.org/en/latest/relay/nodes/#custom-nodes) (example of another client lib)
- We won’t use artificially opaque identifiers in GraphQL. GraphQL operations must follow applicable entity semantics and security requirements, but there’s no reason to opaque fields for the purpose of Relay support.
  - We’ll accept and prefer non-opaque identifier values as input paremeters to GraphQL operations. We’ll provide a non-breaking transition for this change that will accept both opaque and non-opaque values.
  - We’ll transition existing `_id` response fields from the current opaque values to the normal, non-opaque values that are stored in the database.
- New projects may use the primary key field of their choice. We favor `id` in new projects but we don’t dictate it’s use.
- We’re deferring re-implementation of an opaque, globally unique identifier. See [details below](https://www.notion.so/3376924e9d774f3680baf7ba49aed8cd).
- Timeline: New projects may adopt these guidelines immediately. Existing projects may migrate on their own timelines.

### **Backwards Compatible Migration Plan**

We are striving to make this change in a non-breaking way. Here is our migration plan:

1. Add internal fallback to all of Reaction’s existing GraphQL operations that accept opaque `_id`. We will handle in code both opaque and non-opaque _id values.

    ```
    // GraphQL Query:
    getCatalogProduct(catalogProductId: "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I=")
    
    // GraphQL Query, Alternatively provide non-opaque id.
    getCatalogProduct(catalogProductId: "S44MizvckTaCQa4")
    
    // Response (for both query examples)
    {
      // Unchanged. Opaque _id.
      "_id": "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I="
      // ...
    }
    ```

2. Add deprecation tracking, such as logging, to operations providing opaque _ids as input. This is optional if we choose to never remove the compatibility code.
3. Update existing GraphQL APIs to return non-opaque `_id`.

   We will set a feature flag for the encoding so installations can choose to roll back to old behavior. We will configure the flag to default to new behavior in future Reaction version.

    ```
    // GraphQL Query, Unchanged:
    getCatalogProduct(catalogProductId: "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I=")
    getCatalogProduct(catalogProductId: "S44MizvckTaCQa4")
    
    // Response
    {
      // UPDATED: _id is now the unencoded db identifier.
      "_id": "S44MizvckTaCQa4"
    }
    ```

4. Update Reaction [documentation on nodes and IDs](https://docs.reactioncommerce.com/docs/next/graphql-using#nodes-and-ids).
5. New services can immediately use non-opaque identifiers.

    ```
    // Categories (example new service):
    // GraphQL Query: Input is a normal, not-opaque identifier.
    getCategory(id: "6a6dfca6-44d7-49d1-9691-418a6bf1e407")
    
    // Return
    {
      // Actual ID. Not opaque.
      "id": "6a6dfca6-44d7-49d1-9691-418a6bf1e407",
    }
    ```

6. Optional: Sunset opaque ID transformation from GraphQL domain operations.

### **We’re deferring re-implementation of an opaque, globally unique identifier**

We haven’t supported Relay in our existing code. We haven’t seen negative consequences other than the added complexity of our initial attempt. We won’t add such support until it is clear that we need it.

We wanted to ensure that adding support would be possible and drafted a plan in case we decide to do so in the future:

1. We will add a new field `_gqlNodeId` to all GraphQL responses. The `_gql` prefix will sufficiently scope this field to avoid conflicts with actual data. This field will be globally unique, type encoded, and opaque.

    ```
    // GraphQL Query, Unchanged:
    getCatalogProduct(catalogProductId: "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I=")
    getCatalogProduct(catalogProductId: "S44MizvckTaCQa4")
    
    // Response
    {
      "_id": "S44MizvckTaCQa4",
    
      // New field with the opaque GraphQL Node id.
      "_gqlNodeId": "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I=",
      // ...
    }
    ```

2. We will implement the Relay `node` query. It will accept the `_gqlNodeId` field value as the input parameter. This is the only GraphQL operation requiring that input value.
3. We will add [Apollo configuration](https://www.apollographql.com/docs/react/caching/cache-configuration/#custom-identifiers) to the example storefront, if required.

    ```
    // Example.
    const cache = new InMemoryCache({
      dataIdFromObject: object => object._gqlNodeId || object._id || object.id
    });
    ```

4. We won’t use *artificially* opaque identifiers in GraphQL except for `_gqlNodeId`. GraphQL operations should always follow applicable entity semantics and security requirements that make sense for their schema.

## **Decisions that are not in Scope**

GraphQL API owners may add reference attributes as they see fit. Defining such fields is not in scope of this decision record.

```
{
  // Example.
  // GraphQL API's can add identifiers as needed.
  referenceId: "reference_id_from_my_system"
}
```

We do *recommend* limiting lookups and filtering by extra field *when possible* because they require internal change and database indexing.

# Other Options Considered

*What other solutions were considered, if any, and why were they discarded?*

1. Continue our existing convention: name `_id` with id-retrievable value achieved by type prefix and base64 encoding
  - Services may choose any suitable data type for their in-db key
2. Leave our existing `_id` data in place, and introduce `id` as well for compatibility
  1. Deprecate `_id` but leave around for at least 1 full major release cycle, potentially forever
3. Expose the raw db id in a new additional field (`internalId`,`dbid`, `rawId`, etc or some TBD name)
4. Change our id-retrievable approach to put the type as a suffix to force start of opaque IDs to be more easily scannable/speakable/distinguishable
  - “Which product do you need?” “The one that starts ae9b.”
  - I think this might be worthy of consideration regardless of the outcome of this decision record
5. Expose the raw db id in `id`. Use UUIDv1 or ObjectID for the data type. Target apollo compatibility and abandon relay compatibility.

**Option Annotated Examples**

- Current approach

```
{
  "_id": "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I="
}
// True ID (_id in mongo) is a reaction-random (safe chars, fixed-lengh)
//    (S44MizvckTaCQa4GR in this example)
// Opaqued for GraphQL (type prefix + base64)
// Storefront sometimes uses in URLS (SEO, bookmarks)
```

- Option Alfred

```
{
  "_id": "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I="
  // reaction/catalogProduct:S44MizvckTaCQa4GR}
  // type prefix + random from safe charset
  "id": "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I="
  // copy of _id for graphql compat
  "internalId": "S44MizvckTaCQa4GR"
  // exact match from DB
}
```

- Option Betty

```
{
  "id": "00000000-0000-0000-0000-000000000000"
  // raw DB key
  // type prefix + random from safe charset
  "_gqlNodeId": "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I="
  "_id": "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6UzQ0TWl6dmNrVGFDUWE0R1I="
  // copy for backward compatibility
}
```

- Option Clarice

```
// Example Clarice 1
{
  "_id": "S44MizvckTaCQa4GR"
  // raw _id directly exposed (reaction random)
  // Compatibility layer will also accept and correctly proccess
  // an opaqued graphql id here for existing reaction graphql API
 }

// Example Clarice 2
{
  "id": "00000000-0000-0000-0000-000000000000"
  // This type uses "id" in its DB so it exposes that
  // UUID data type, encoded as string in JSON
  // New types introduced after reaction 3.0 do not
  // need to present or except an opaque id
}

// Example Clarice 3

{
  "isbn": "978-3-16-148410-0"
}

// Name and type of identifier field can use natural ID where appropriate
```

- Option Murray

```
// Query payload (Sample record)
{
  // Raw database id
  "_id": "S44MizvckTaCQa4GR",
  "sampleId": "S44MizvckTaCQa4GR"

  // Reference id
  "referenceId": "1234"

  // Encoded Id
  "_nodeId": "cmVhY3Rpb24vc2FtcGxlOlM0NE1penZja1RhQ1FhNEdS"
}

// Mutation input (Sample record input)
{
  // Can be an opaque ID like it's always been
  "sampleId": "cmVhY3Rpb24vc2FtcGxlOlM0NE1penZja1RhQ1FhNEdS"

  // Can also be the internal DB ID
  "sampleId": "S44MizvckTaCQa4GR"
}
```

# Risks and Consequences

- **Community fatigue.** The proposal changes common fields in the API. The decision states that existing projects “can migrate on their own timelines.” A lengthy transition could add to the community fatigue.
- **SEO and frontend routes might be affected** if frontends have permitted the opaque IDs to bleed into URL routes. We should call out that base64 encoded URL components aren’t getting anyone an SEO boost. Shadowing the real identifiers with opaque ones has contributed to this problem and we are trying to course correct with this decision.

The risks below were mitigated by choosing to not implement `_gqlNodeId`. In doing so we reduced the surface area of the changes and the complexity of the migration.

- `_gqlNodeId` **isn’t compatible with either Apollo or Relay conventions.**

  Our choice will require some additional configuration in both clients. Developers will notice this and developers may frequently ask for our rationale on this decision.

  - In most cases, caching will continue to work in Apollo client. It will use `_id` and fall back to `id` for caching. Cache conflicts are avoided if those fields are globally unique. We’re using pseudo-random keys in MongoDB and UUID’s in other places. Global uniqueness is likely but not guaranteed. Clients can [update their config](https://www.notion.so/3376924e9d774f3680baf7ba49aed8cd) to make full use of the `_gqlNodeId` field for caching.
- **The migration path has several steps and a large surface area.** We are trying to mitigate the risks with this by planning the migration as best we can before committing to the decision.

# FAQ

Questions and proposed answers:

1. Will Reaction support Relay?
  - As of Feb 2020, not at this time
2. Do we require standard IDs in GraphQL operations?
  - No. We prefer a standard ID field and value but it is not a requirement.
3. Do IDs need to be globally unique?
  - No. Apollo caching does not require this nor does anything within Reaction.
4. Which ID data types are allowable?
  - UUIDv1, UUIDv4, random string of safe chars, integers. Generally we want compatibility with external systems & flexibility for integrations so we don’t want to impose restrictions.
5. Do we support offline/advance creation of IDs in client applications?
  - In most cases yes, although our current services and applications are online-only
6. Is there a solution where we could persist the typed GUID?
  - Theoretically, yes. Though our final decision resulted in not passing a globally unique ID so this is will not be required.
7. Is Relay a major player in GQL client-side frameworks?
  - Maybe not defacto but not negligable.
8. What benefits would we get from globally unique GQL IDs?
  - It’s important to call out two concerns that can get conflated. First, globally unique identifiers can help with caching in some GraphQL clients where the identifer is used as a key in a global cache. The second concern is the ability to introspect a node by id and determine which GraphQL resolver should be used to resolve the record. This makes it possible to implement the `node` query that’s required in the Relay spec. Neither GraphQL nor Relay specify exactly how the type should be inferred from any given identifier, so it’s up to the implementation to decide how to handle that. In our first GraphQL iteration we concatenated the GraphQL type and the identifier and then base-64 encoded the value to make it opaque. Though we manipulated the values we didn’t actually implement the `node` query and so we didn’t see benefits from doing this. Please see [this section](https://www.notion.so/3376924e9d774f3680baf7ba49aed8cd) of this decision to read more about how we may support the `node` query in the future.

import gql from "graphql-tag";

export default gql`
  query getTags($shopId: ID!, $isTopLevel: Boolean!) {
    tags(shopId: $shopId, isTopLevel: $isTopLevel) {
      nodes {
        _id,
        name,
        slug,
        heroMediaUrl,
        position
        subTags {
          nodes {
            _id,
            name,
            slug,
            heroMediaUrl,
            position
          }
        },
      }

    }
  }
`;

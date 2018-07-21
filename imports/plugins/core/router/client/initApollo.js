import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

export const meteorAccountsLink = new ApolloLink((operation, forward) => {
  const token = Accounts._storedLoginToken();

  operation.setContext(() => ({
    headers: {
      'meteor-login-token': token,
    },
  }));

  return forward(operation);
});


export default function initApollo() {
  return new ApolloClient({
    link: meteorAccountsLink.concat(new HttpLink({ uri: Meteor.absoluteUrl('graphql-alpha') })),
    cache: new InMemoryCache()
  });
}

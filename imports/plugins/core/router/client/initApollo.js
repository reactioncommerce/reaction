import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { createApolloClient } from "meteor/apollo";

const meteorAccountsLink = new ApolloLink((operation, forward) => {
  const token = Accounts._storedLoginToken();

  operation.setContext(() => ({
    headers: {
      'meteor-login-token': token,
    },
  }));

  return forward(operation);
});

export default function initApollo() {
  return createApolloClient({
    link: meteorAccountsLink.concat(new HttpLink({ uri: Meteor.absoluteUrl('graphql-alpha') }))
  });
}

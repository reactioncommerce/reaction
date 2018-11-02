import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const getAddressValidationServices = gql`
  query getAddressValidationServices {
    addressValidationServices {
      displayName
      name
      supportedCountryCodes
    }
  }
`;

export default (Component) => (
  class AddressValidationServicesQuery extends React.Component {
    render() {
      return (
        <Query query={getAddressValidationServices}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingAddressValidationServices: loading
            };

            if (!loading && data) {
              props.addressValidationServices = data.addressValidationServices;
            }

            return (
              <Component {...props} />
            );
          }}
        </Query>
      );
    }
  }
);

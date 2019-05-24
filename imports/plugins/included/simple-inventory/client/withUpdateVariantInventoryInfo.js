import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import getInventoryInfo from "./getInventoryInfo";

const updateSimpleInventoryMutation = gql`
  mutation updateSimpleInventoryMutation($input: UpdateSimpleInventoryInput!) {
    updateSimpleInventory(input: $input) {
      inventoryInfo {
        canBackorder
        inventoryInStock
        inventoryReserved
        isEnabled
        lowInventoryWarningThreshold
      }
    }
  }
`;

export default (Component) => (
  class WithUpdateSimpleInventory extends React.Component {
    static propTypes = {
      variables: PropTypes.object
    }

    render() {
      const { variables } = this.props;

      return (
        <Mutation
          mutation={updateSimpleInventoryMutation}
          update={(cache, { data: { updateSimpleInventory } }) => {
            if (updateSimpleInventory && updateSimpleInventory.inventoryInfo) {
              cache.writeQuery({
                query: getInventoryInfo,
                variables,
                data: {
                  simpleInventory: { ...updateSimpleInventory.inventoryInfo }
                }
              });
            }
          }}
        >
          {(updateSimpleInventory) => (
            <Component
              {...this.props}
              updateSimpleInventory={updateSimpleInventory}
            />
          )}
        </Mutation>
      );
    }
  }
);

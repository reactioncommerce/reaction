import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import getInventoryInfo from "./getInventoryInfo";

const recalculateReservedSimpleInventoryMutation = gql`
  mutation recalculateReservedSimpleInventoryMutation($input: RecalculateReservedSimpleInventoryInput!) {
    recalculateReservedSimpleInventory(input: $input) {
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
          mutation={recalculateReservedSimpleInventoryMutation}
          update={(cache, { data: { recalculateReservedSimpleInventory } }) => {
            if (recalculateReservedSimpleInventory && recalculateReservedSimpleInventory.inventoryInfo) {
              cache.writeQuery({
                query: getInventoryInfo,
                variables,
                data: {
                  simpleInventory: { ...recalculateReservedSimpleInventory.inventoryInfo }
                }
              });
            }
          }}
        >
          {(recalculateReservedSimpleInventory) => (
            <Component
              {...this.props}
              recalculateReservedSimpleInventory={recalculateReservedSimpleInventory}
            />
          )}
        </Mutation>
      );
    }
  }
);

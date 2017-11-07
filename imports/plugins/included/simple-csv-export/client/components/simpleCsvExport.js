import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";


class SimpleCSVExport extends Component {
  render() {
    return  (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="admin.settings.smsProvider"
            title="SMS Provider"
          />
          <Components.CardBody expandable={true}>
            <button>
              Export
            </button>
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

export default SimpleCSVExport;

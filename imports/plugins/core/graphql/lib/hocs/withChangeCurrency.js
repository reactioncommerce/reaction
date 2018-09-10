
import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import changeCurrency from "../mutations/changeCurrency";

export default (Comp) => (
  class ChangeLanguage extends Component {
    render() {
      return (
        <Mutation mutation={changeCurrency} onError={() => undefined} onCompleted={this.props.refetchViewer}>
          {(changeCurrencyResult, { error, data, loading }) => {
            if (error) {
              Logger.error(error);
              throw new ReactionError("query-error");
            }
            return <Comp
              {...this.props}
              changeLanguageData={data}
              isLoadingChangeLanguage={loading}
              changeCurrency={changeCurrencyResult}
            />;
          }}
        </Mutation>
      );
    }
  }
);

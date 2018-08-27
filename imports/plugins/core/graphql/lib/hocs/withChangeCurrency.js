
import React, { Component } from "react";
import { Mutation } from "react-apollo";
import changeCurrency from "../mutations/changeCurrency";

export default (Comp) => (
  class ChangeLanguage extends Component {
    render() {
      return (
        <Mutation mutation={changeCurrency} onError={() => undefined} onCompleted={this.props.refetchViewer}>
          {(changeCurrencyResult, { data, loading }) => (
            <Comp
              {...this.props}
              changeLanguageData={data}
              isLoadingChangeLanguage={loading}
              changeCurrency={changeCurrencyResult}
            />
          )}
        </Mutation>
      );
    }
  }
);

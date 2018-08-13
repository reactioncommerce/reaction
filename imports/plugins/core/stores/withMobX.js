import React from "react";
import { Provider } from "mobx-react";
import rootMobxStores from "./index";

/**
 * @summary Provides MobX stores to each page.
 *
 * @param {Node} Component - The component to wrap
 * @returns {Node} - The wrapped component with Mobx stores add the react context.
 */
function withMobX(Component) {
  class WithMobX extends React.Component {
    render() {
      return (
        <Provider {...rootMobxStores} >
          <Component {...this.props}/>
        </Provider>
      );
    }
  }

  return WithMobX;
}

export default withMobX;

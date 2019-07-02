import { Component } from "react";
import PropTypes from "prop-types";
import Logger from "@reactioncommerce/logger";

class GenericErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.node,
    fallbackComponent: PropTypes.node
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }


  componentDidCatch(error, info) {
    Logger.error(info, error);
  }

  render() {
    const { children, fallbackComponent } = this.props;
    if (this.state.hasError) {
      // Render the fallback if there's an error
      return fallbackComponent;
    }

    return children;
  }
}

export default GenericErrorBoundary;

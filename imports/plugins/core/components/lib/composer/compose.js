import React from "react";
import shallowEqual from "shallowequal";
import hoistStatics from "hoist-non-react-statics";
import _ from "lodash";
import { getDisplayName } from "recompose";

/**
 * @file Reaction Components API
 *
 * @module components
 */

export default function compose(dataLoader, options = {}) {
  return function (Child) {
    const {
      errorHandler = (err) => { throw err; },
      loadingHandler = () => null,
      env = {},
      pure = false,
      propsToWatch = null, // Watch all the props.
      shouldSubscribe = null,
      shouldUpdate = null
    } = options;

    class Container extends React.Component {
      constructor(props, ...args) {
        super(props, ...args);
        this.state = {};
        this.propsCache = {};
      }

      componentWillMount() {
        this._subscribe(this.props);
      }

      componentWillReceiveProps(props) {
        this._subscribe(props);
      }

      shouldComponentUpdate(nextProps, nextState) {
        if (shouldUpdate) {
          return shouldUpdate(this.props, nextProps);
        }

        if (!pure) {
          return true;
        }

        return (
          !shallowEqual(this.props, nextProps) ||
          this.state.error !== nextState.error ||
          !shallowEqual(this.state.data, nextState.data)
        );
      }

      componentWillUnmount() {
        this._unmounted = true;
        this._unsubscribe();
      }

      _shouldSubscribe(props) {
        const firstRun = !this._cachedWatchingProps;
        const nextProps = _.pick(props, propsToWatch);
        const currentProps = this._cachedWatchingProps || {};
        this._cachedWatchingProps = nextProps;

        if (firstRun) return true;
        if (typeof shouldSubscribe === "function") {
          return shouldSubscribe(currentProps, nextProps);
        }

        if (propsToWatch === null) return true;
        if (propsToWatch.length === 0) return false;
        return !shallowEqual(currentProps, nextProps);
      }

      _subscribe(props) {
        if (!this._shouldSubscribe(props)) return;

        const onData = (error, data) => {
          if (this._unmounted) {
            throw new Error(`Trying to set data after component(${Container.displayName}) has unmounted.`);
          }

          const payload = { error, data };
          this.setState(payload);
        };

        // We need to do this before subscribing again.
        this._unsubscribe();
        this._stop = dataLoader(props, onData, env);
      }

      _unsubscribe() {
        if (this._stop) {
          this._stop();
        }
      }

      render() {
        const props = this.props;
        const { data, error } = this.state;

        if (error) {
          return errorHandler(error);
        }

        if (!data) {
          return loadingHandler();
        }

        const finalProps = {
          ...props,
          ...data
        };

        const setChildRef = (c) => {
          this.child = c;
        };

        return (
          <Child ref={setChildRef} {...finalProps} />
        );
      }
    }

    Container.__composerData = {
      dataLoader,
      options
    };

    Container.displayName = `Tracker(${getDisplayName(Child)})`;

    hoistStatics(Container, Child);

    return Container;
  };
}

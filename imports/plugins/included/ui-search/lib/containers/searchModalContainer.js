import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDom from "react-dom";
import { compose } from "recompose";
import _ from "lodash";
import { Reaction } from "/client/api";
import { registerComponent } from "@reactioncommerce/reaction-components";
import SearchSubscription from "./searchSubscription";

function tagToggle(arr, val) {
  if (arr.length === _.pull(arr, val).length) {
    arr.push(val);
  }
  return arr;
}

function getModalRootNode() {
  let modalNode = document.getElementById("search-modal-root");

  if (modalNode) {
    return modalNode;
  }

  modalNode = document.createElement("div");
  modalNode.setAttribute("id", "search-modal-root");
  document.body.appendChild(modalNode);

  return modalNode;
}

const wrapComponent = (Comp) => (
  class SearchModalContainer extends Component {
    static propTypes = {
      onClose: PropTypes.func,
      open: PropTypes.bool
    }

    constructor(props) {
      super(props);
      this.state = {
        collection: "products",
        value: localStorage.getItem("searchValue") || "",
        renderChild: true,
        facets: []
      };
    }

    componentDidMount() {
      document.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("popstate", this.handleUrlChange);
    }

    componentWillUnmount() {
      document.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("popstate", this.handleUrlChange);
    }

    handleUrlChange = () => {
      this.handleChildUnmount();
    }

    handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        this.setState({
          renderChild: false
        });
      }
    }

    handleChange = (event, value) => {
      localStorage.setItem("searchValue", value);

      this.setState({ value });
    }

    handleClick = () => {
      localStorage.setItem("searchValue", "");
      this.setState({ value: "" });
    }

    handleAccountClick = (event) => {
      Reaction.Router.go("account/profile", {}, { userId: event._id });
      this.handleChildUnmount();
    }

    handleTagClick = (tagId) => {
      const newFacet = tagId;
      const element = document.getElementById(tagId);
      element.classList.toggle("active-tag");

      this.setState({
        facets: tagToggle(this.state.facets, newFacet)
      });
    }

    handleToggle = (collection) => {
      this.setState({ collection });
    }

    handleChildUnmount = () => {
      if (this.props.onClose) {
        this.props.onClose();
      }
    }

    render() {
      return ReactDom.createPortal(
        (
          <div>
            {this.props.open ?
              <div className="rui search-modal js-search-modal">
                <Comp
                  handleChange={this.handleChange}
                  handleClick={this.handleClick}
                  handleToggle={this.handleToggle}
                  handleAccountClick={this.handleAccountClick}
                  handleTagClick={this.handleTagClick}
                  value={this.state.value}
                  unmountMe={this.handleChildUnmount}
                  searchCollection={this.state.collection}
                  facets={this.state.facets}
                />
              </div> : null
            }
          </div>
        ), getModalRootNode()
      );
    }
  }
);

registerComponent("SearchSubscription", SearchSubscription, [wrapComponent]);

export default compose(wrapComponent)(SearchSubscription);

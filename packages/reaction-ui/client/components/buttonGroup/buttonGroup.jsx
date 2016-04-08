import React from "react";

const Items = ReactionUI.Components.Items;
const classnames = ReactionUI.Lib.classnames;

class ButtonGroup extends React.Component {

  renderButtons() {
    if (this.props.children) {
      const items = this.props.children.map((item, index) => {
        // if (this.props.autoWrap) {   return (     <Item key={index}>       {React.cloneElement(item)}     </Item>   ); }

        return React.cloneElement(item);
      });

      return items;
    }
  }

  render() {
    const classes = classnames({rui: true, buttons: true})

    return (
      <div className="rui buttons">
        <Items autoWrap={false} direction="vertical">
          {this.renderButtons()}
        </Items>
      </div>
    );
  }
}

ReactionUI.Components.ButtonGroup = ButtonGroup;

import ReactDOM from "react-dom";
import { Blaze } from "meteor/blaze";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";
import BlazeComponent from "meteor/gadicc:blaze-react-component";
import PropTypes from "prop-types";

class BlazeLayout extends BlazeComponent {
  static propTypes = {
    blazeLayout: PropTypes.any
  }

  componentDidUpdate(prevProps) {
    if (prevProps.blazeTemplate !== this.props.blazeTemplate) {
      Blaze.remove(this._blazeView);
      this.renderBlazeView();
    }
  }

  renderBlazeView() {
    this._blazeData = new ReactiveVar(_.omit(this.props, "blazeTemplate"));

    let template;
    const tArg = this.props.blazeTemplate;

    if (typeof tArg === "string") {
      template = Template[tArg];
      if (!template) {
        throw new Error(`No Template["${tArg}"] exists.  If this template `
          + "originates in your app, make sure you have the `templating` "
          + "package installed (and not, for e.g. `static-html`)");
      }
    } else if (tArg instanceof Blaze.Template) {
      template = tArg;
    } else {
      throw new Error("Invalid blazeTemplate= argument specified.  Expected "
        + "the string name of an existing Template, or the template "
        + "itself, instead got ''" + typeof tArg + ": "
        + JSON.stringify(tArg));
    }

    this._blazeView = Blaze.renderWithData(
      template,
      () => this._blazeData.get(),
      ReactDOM.findDOMNode(this._blazeRef)
    );
  }

  shouldComponentUpdate(nextProps) {
    // Never call render() for props except template again; Blaze will do what's necessary.
    return nextProps.blazeTemplate !== this.props.blazeTemplate;
  }

  componentWillReceiveProps(nextProps) {
    this._blazeData.set(_.omit(nextProps, "blazeTemplate"));
  }
}

export default BlazeLayout;

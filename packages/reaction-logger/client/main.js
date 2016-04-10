import { checkNpmVersions } from "meteor/tmeasday:check-npm-versions";

checkNpmVersions({
  "bunyan": "1.8.x",
  "bunyan-format": "0.2.x"
}, "reactioncommerce:reaction-logger");

// If you are using the dependency in the same file, you'll need to use require, otherwise
// you can continue to `import` in another file.
require("bunyan-format");
import bunyan from "bunyan";

export { bunyan };

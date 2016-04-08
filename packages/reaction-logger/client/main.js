import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
  "bunyan": "1.8.0"
}, 'reactioncommerce:reaction-logger');

// If you are using the dependency in the same file, you'll need to use require, otherwise
// you can continue to `import` in another file.

import { util } from 'util';
import bunyan from 'bunyan';

// const bunyan = require('bunyan');
export { bunyan };

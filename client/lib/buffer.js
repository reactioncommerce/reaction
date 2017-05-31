// this is an expensive polyfill for clientside Buffer usage
// TODO refactor to remove this buffer dependency
global.Buffer = global.Buffer || require("buffer").Buffer; // eslint-disable-line

// how to refactor
// you can easily drop a breakpoint on the error in your browser's inspector, then refresh the page to hit the breakpoint and see via the call stack which package is trying to use Buffer
// https://github.com/meteor/meteor/issues/8645

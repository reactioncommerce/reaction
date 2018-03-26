import runMeteorMethodWithContext from "./runMeteorMethodWithContext";

const methods = {};

[
  "accounts/addressBookAdd",
  "accounts/addressBookUpdate"
].forEach((methodName) => {
  methods[methodName] = (context, args) => {
    return runMeteorMethodWithContext(context, methodName, args);
  };
});

export default methods;

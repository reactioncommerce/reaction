import runMeteorMethodWithContext from "./runMeteorMethodWithContext";

const methods = {};

[
  "accounts/addressBookAdd",
  "accounts/addressBookUpdate",
  "accounts/setProfileCurrency"
].forEach((methodName) => {
  methods[methodName] = (context, args) => (
    runMeteorMethodWithContext(context, methodName, args)
  );
});

export default methods;

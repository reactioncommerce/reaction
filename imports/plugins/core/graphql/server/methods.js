import runMeteorMethodWithContext from "./runMeteorMethodWithContext";

const methods = {};

[
  "accounts/addressBookAdd",
  "accounts/addressBookUpdate",
  "accounts/updateEmailAddress"
].forEach((methodName) => {
  methods[methodName] = (context, args) => (
    runMeteorMethodWithContext(context, methodName, args)
  );
});

export default methods;

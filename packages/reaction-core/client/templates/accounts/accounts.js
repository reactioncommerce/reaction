/**
* accounts events
* TODO: review most of this can be removed
*/


var changePassword, correctDropdownZIndexes, elementValueById, forgotPassword, login, loginButtonsSession, loginOrSignup, matchPasswordAgainIfPresent, passwordSignupFields, signup, trimmedElementValueById, validateEmail, validatePassword, validateUsername;

loginButtonsSession = Accounts._loginButtonsSession;

Template.accounts.events({
  "click #login-buttons-password": function() {
    loginOrSignup();
  },
  "keypress #forgot-password-email": function(event) {
    if (event.keyCode === 13) {
      forgotPassword();
    }
  },
  "click #login-buttons-forgot-password": function() {
    forgotPassword();
  },
  "click #signup-link": function() {
    var email, password, redraw, username, usernameOrEmail;
    loginButtonsSession.resetMessages();
    username = trimmedElementValueById("login-username");
    email = trimmedElementValueById("login-email");
    usernameOrEmail = trimmedElementValueById("login-username-or-email");
    password = elementValueById("login-password");
    loginButtonsSession.set("inSignupFlow", true);
    loginButtonsSession.set("inForgotPasswordFlow", false);
    Tracker.flush();
    if (username !== null) {
      document.getElementById("login-username").value = username;
    } else if (email !== null) {
      document.getElementById("login-email").value = email;
    } else if (usernameOrEmail !== null) {
      if (usernameOrEmail.indexOf("@") === -1) {
        document.getElementById("login-username").value = usernameOrEmail;
      } else {
        document.getElementById("login-email").value = usernameOrEmail;
      }
    }
    if (password !== null) {
      document.getElementById("login-password").value = password;
    }
    redraw = document.getElementById("login-dropdown-list");
    if (redraw) {
      redraw.style.display = "none";
      redraw.offsetHeight;
      redraw.style.display = "block";
    }
  },
  "click #forgot-password-link": function() {
    var email, usernameOrEmail;
    loginButtonsSession.resetMessages();
    email = trimmedElementValueById("login-email");
    usernameOrEmail = trimmedElementValueById("login-username-or-email");
    loginButtonsSession.set("inSignupFlow", false);
    loginButtonsSession.set("inForgotPasswordFlow", true);
    Tracker.flush();
    if (email !== null) {
      document.getElementById("forgot-password-email").value = email;
    } else {
      if (usernameOrEmail !== null) {
        if (usernameOrEmail.indexOf("@") !== -1) {
          document.getElementById("forgot-password-email").value = usernameOrEmail;
        }
      }
    }
  },
  "click #back-to-guest-login-link": function() {
    var email;
    loginButtonsSession.resetMessages();
    email = trimmedElementValueById("login-email") || trimmedElementValueById("forgot-password-email");
    loginButtonsSession.set('inSignupFlow', false);
    loginButtonsSession.set('inForgotPasswordFlow', false);
    Tracker.flush();
    if (document.getElementById("login-email")) {
      document.getElementById("login-email").value = email;
    }
    if (document.getElementById("login-username-or-email")) {
      return document.getElementById("login-username-or-email").value = email || username;
    }
  },
  "click #back-to-login-link": function() {
    var email, password, username;
    loginButtonsSession.resetMessages();
    username = trimmedElementValueById("login-username");
    email = trimmedElementValueById("login-email") || trimmedElementValueById("forgot-password-email");
    password = elementValueById("login-password");
    loginButtonsSession.set("inSignupFlow", false);
    loginButtonsSession.set("inForgotPasswordFlow", false);
    Tracker.flush();
    if (document.getElementById("login-username")) {
      document.getElementById("login-username").value = username;
    }
    if (document.getElementById("login-email")) {
      document.getElementById("login-email").value = email;
    }
    if (document.getElementById("login-username-or-email")) {
      document.getElementById("login-username-or-email").value = email || username;
    }
    if (password !== null) {
      document.getElementById("login-password").value = password;
    }
  },
  "keypress #login-username, keypress #login-email, keypress #login-username-or-email, keypress #login-password, keypress #login-password-again": function(event) {
    if (event.keyCode === 13) {
      loginOrSignup();
    }
  }
}, passwordSignupFields = function() {
  return Accounts.ui._options.passwordSignupFields || "EMAIL_ONLY";
}, validateUsername = function(username) {
  if (username.length >= 3) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Username must be at least 3 characters long");
    return false;
  }
}, validateEmail = function(email) {
  if (passwordSignupFields() === "USERNAME_AND_OPTIONAL_EMAIL" && email === "") {
    return true;
  }
  if (email.indexOf("@") !== -1) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Invalid email");
    return false;
  }
}, validatePassword = function(password) {
  if (password.length >= 6) {
    return true;
  } else {
    loginButtonsSession.errorMessage("Password must be at least 6 characters long");
    return false;
  }
}, elementValueById = function(id) {
  var element;
  element = document.getElementById(id);
  if (!element) {
    return null;
  } else {
    return element.value;
  }
}, trimmedElementValueById = function(id) {
  var element;
  element = document.getElementById(id);
  if (!element) {
    return null;
  } else {
    return element.value.replace(/^\s*|\s*$/g, "");
  }
}, loginOrSignup = function() {
  if (loginButtonsSession.get("inSignupFlow")) {
    signup();
  } else {
    login();
  }
}, login = function() {
  var email, loginSelector, password, username, usernameOrEmail;
  loginButtonsSession.resetMessages();
  username = trimmedElementValueById("login-username");
  email = trimmedElementValueById("login-email");
  usernameOrEmail = trimmedElementValueById("login-username-or-email");
  password = elementValueById("login-password");
  loginSelector = void 0;
  if (username !== null) {
    if (!validateUsername(username)) {
      return;
    } else {
      loginSelector = {
        username: username
      };
    }
  } else if (email !== null) {
    if (!validateEmail(email)) {
      return;
    } else {
      loginSelector = {
        email: email
      };
    }
  } else if (usernameOrEmail !== null) {
    if (!validateUsername(usernameOrEmail)) {
      return;
    } else {
      loginSelector = usernameOrEmail;
    }
  } else {
    throw new Error("Unexpected -- no element to use as a login user selector");
  }
  Meteor.loginWithPassword(loginSelector, password, function(error, result) {
    if (error) {
      loginButtonsSession.errorMessage(error.reason || "Unknown error");
    } else {
      loginButtonsSession.closeDropdown();
    }
  });
}, signup = function() {
  var email, options, password, username;
  loginButtonsSession.resetMessages();
  options = {};
  username = trimmedElementValueById("login-username");
  if (username !== null) {
    if (!validateUsername(username)) {
      return;
    } else {
      options.username = username;
    }
  }
  email = trimmedElementValueById("login-email");
  if (email !== null) {
    if (!validateEmail(email)) {
      return;
    } else {
      options.email = email;
    }
  }
  password = elementValueById("login-password");
  if (!validatePassword(password)) {
    return;
  } else {
    options.password = password;
  }
  if (!matchPasswordAgainIfPresent()) {
    return;
  }
  Accounts.createUser(options, function(error) {
    if (error) {
      loginButtonsSession.errorMessage(error.reason || "Unknown error");
    } else {
      loginButtonsSession.closeDropdown();
    }
  });
});

forgotPassword = function() {
  var email;
  loginButtonsSession.resetMessages();
  email = trimmedElementValueById("forgot-password-email");
  if (email.indexOf("@") !== -1) {
    Accounts.forgotPassword({
      email: email
    }, function(error) {
      if (error) {
        loginButtonsSession.errorMessage(error.reason || "Unknown error");
      } else {
        loginButtonsSession.infoMessage("Email sent");
      }
    });
  } else {
    loginButtonsSession.errorMessage("Invalid email");
  }
};

changePassword = function() {
  var oldPassword, password;
  loginButtonsSession.resetMessages();
  oldPassword = elementValueById("login-old-password");
  password = elementValueById("login-password");
  if (!validatePassword(password)) {
    return;
  }
  if (!matchPasswordAgainIfPresent()) {
    return;
  }
  Accounts.changePassword(oldPassword, password, function(error) {
    if (error) {
      loginButtonsSession.errorMessage(error.reason || "Unknown error");
    } else {
      loginButtonsSession.set("inChangePasswordFlow", false);
      loginButtonsSession.set("inMessageOnlyFlow", true);
      loginButtonsSession.infoMessage("Password changed");
    }
  });
};

matchPasswordAgainIfPresent = function() {
  var password, passwordAgain;
  passwordAgain = elementValueById("login-password-again");
  if (passwordAgain !== null) {
    password = elementValueById("login-password");
    if (password !== passwordAgain) {
      loginButtonsSession.errorMessage("Passwords don't match");
      return false;
    }
  }
  return true;
};

correctDropdownZIndexes = function() {
  var n;
  n = document.getElementById("login-dropdown-list").parentNode;
  while (n.nodeName !== "BODY") {
    if (n.style.zIndex === 0) {
      n.style.zIndex = 1;
    }
    n = n.parentNode;
  }
};


/*
 * use all this with the unauthorized login as well
 */

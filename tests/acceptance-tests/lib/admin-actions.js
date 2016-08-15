let yaml = require("js-yaml");
let fs   = require("fs");

let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
let usrData = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/user-data.yml", "utf8"));

function userLogin(user){
  browser.pause("5000");
  browser.click(eleMap.login_dropdown_btn);
  if (user === "admin") {
    browser.setValue(eleMap.login_email_fld, usrData.admin_email);
    browser.setValue(eleMap.login_pw_fld, usrData.admin_pw);
  }
  if (user === "guest") {
    browser.setValue(eleMap.login_email_fld, usrData.guest_email);
    browser.setValue(eleMap.login_pw_fld, usrData.guest_pw);
  }
  browser.click(eleMap.login_btn);
  browser.pause("5000");
}

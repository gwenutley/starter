// Needed Resources 
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const validate = require("../utilities/account-validation");

//GET route for the account
router.get("/login", utilities.handleErrors(accountController.buildLogin));


//get the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

//registration route
router.post('/register',
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

//route to the account management view 
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

//logout route
router.get("/logout", utilities.handleErrors(accountController.logout));

//account management update view
router.get("/update/:id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount));

//route to the update account info
router.post("/update/:id", validate.updateAccountRules(), validate.checkUpdateData, utilities.handleErrors(accountController.updateAccountInfo));

//route to the change password
router.post("/update-password/:id", validate.updatePasswordRules(), validate.checkPasswordData, utilities.handleErrors(accountController.updateAccountPassword));

//export router
module.exports = router;


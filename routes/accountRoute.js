// Needed Resources 
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const validate = require("../utilities/account-validation")

//GET route for the account
router.get("/login", utilities.handleErrors(accountController.buildLogin));


//get the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//registration route
router.post('/register',
    validate.registrationRules(),
    validate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

//export router
module.exports = router;


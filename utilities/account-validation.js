const utilities = require(".")
const accountModel = require("../models/account-model")

const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ min: 1 })
        .withMessage("First name needs at least 1 character"), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .notEmpty()
      .withMessage("A valid email is required.")
      .isEmail().withMessage("Please enter valid email")
      .normalizeEmail() // refer to validator.js docs
      .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
                throw new Error("Email exists. Please log in or use different email")
            }
      }),
      
      // password is required and must be strong password
      body("account_password")
        .notEmpty()
        .withMessage("Password is required")
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}
  
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/***********************************
 * validation forthe login
 *********************************/
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please enter a valid emial")
      .isEmail(),
    
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please enter a valid password")
  ]
}


/***************************
 * Check the login data forerrors
 *****************************/
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      message: null,
      account_email
    })
    return
  }
  next()
}


/***************************
 * Check the update info or password 
 **************************/
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 1 })
      .withMessage("Name needs at least 1 character"),
    
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2 })
      .withMessage("Please enter last name"),
    
    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Valid email is required")
      .isEmail().withMessage("Please enter valid email")
      .normalizeEmail()
      .custom(async (account_email, { req }) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists && account_email !== req.body.current_email) {
          throw new Error("Email exists. Please enter a different one")
        }
      }),
  ]
}

/********************************
 * Check the updated account data
 ***************************/
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*******************************
 * update password rules
 *********************/
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .notEmpty()
      .withMessage("Password is required")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password doesn't meet requirements"),
    
    body("confirm_password")
      .custom((value, { req }) => {
        if (value !== req.body.account_password) {
          throw new Error("Passwords do not match")
        }
        return true
      }),
  ]
}

/***************************
 * Check the updated password data
 ****************************/
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  const { account_password } = req.body;
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Password",
      nav,
      account_password,

    })
    return;
  }
  next();
}

module.exports = validate

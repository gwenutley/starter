//require statements
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { validationResult } = require("express-validator");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],
  })
}

//deliver the register view
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: [],
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body


  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: [],
    })
  }


  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: [],
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [],
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


/******************************
 * Process funcation return management view
 ******************************/
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;

  if (!accountData) {
    req.flash("notice", "Please log in to view your account");
    return res.redirect("/account/login");
  }

  res.render("account/management", {
    title: "Account Management",
    nav,
    message: req.flash("notice"),
    errors: [],
    accountData,
  });
}

/**********************
 * create the update account view
 ************************/
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;

  if (!accountData) {
    req.flash("notice", "Please login to update account");
    return res.redirect("/account/login");

  }

  res.render("account/update", {
    title: "Update Account",
    nav,
    message: req.flash("notice"),
    errors: [],
    accountData,
  });
}


/***************************
 * process the updated account info
 ************************/
async function updateAccountInfo(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email } = req.body;
  const account_id = parseInt(req.params.id);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      message: "",
      errors: errors.array(),
      accountData: { account_firstname, account_lastname, account_email, account_id },
    });
  }

  const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

  if (result) {
    req.flash("notice", "Account info updated successfully");
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Failed to update account. Try again");
    return res.status(500).render("account/update", {
      title: "update Account",
      nav,
      message: "",
      errors: [],
      accountData: { account_firstname, account_lastname, account_email, account_id },
    });
  }
}

/************************
 * process the password update
 **************************/
async function updateAccountPassword(req, res) {
  let nav = await utilities.getNav();
  const { account_password } = req.body;
  const account_id = parseInt(req.params.id);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      message: "",
      errors: errors.array(),
      accountData: { account_id },
    });
  }

  const hashedPassword = await bcrypt.hash(account_password, 12);
  const result = await accountModel.updatePassword(account_id, hashedPassword);

  if (result) {
    req.flash("notice", "Password updated successfully");
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Failed to update password. Try again");
    return res.status(500).render("account/update", {
      title: "update Account",
      nav,
      message: "",
      errors: [],
      accountData: { account_id },
    });
  }
}






/******************************
 *  Process Logout
 ***********************/
async function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, logout, buildUpdateAccount, updateAccountInfo, updateAccountPassword }
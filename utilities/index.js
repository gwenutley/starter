const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = "";
  if(data.length > 0){
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid
}

/* ****************************
  *Build the vehicle views in html
 **************************** */
Util.buildVehicleDetail = function (vehicle) {
  const price = new Intl.NumberFormat('en-US').format(vehicle.inv_price)
  const miles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)
  const page =
      `<h1>${vehicle.inv_make} ${vehicle.inv_model} ${vehicle.inv_year}</h1>
        <div class="vehicle-detail">
          <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
          <div class="vehicle-info">
            <p><strong>Price:</strong> $${price}</p>
            <p><strong>Description:</strong> ${vehicle.inv_description}</p>
            <p><strong>Color:</strong> ${vehicle.inv_color}</p>
            <p><strong>Mileage:</strong> ${miles}</p>
          </div>
        </div>`
  
  return page
}

/*************************
 * Build the select dropdown for classification addition
 *************************/
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications();
  let classificationList = `<select name="classification_id" id="classificationList" required>
    <option value=''>Choose a Classification</option>`;

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" ${
      classification_id != null && row.classification_id == classification_id
        ? "selected"
        : ""
    }>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
};


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}


/*****************************
 * check if admin or employee
 **************************/
Util.checkAdminEmployee = (req, res, next) => {
  if (res.locals.accountData) {
    const accountType = res.locals.accountData.account_type;
    if (accountType === "Admin" || accountType === "Employee") {
      return next();
    }
  }
  req.flash("notice", "Access denied, please login as a manager or employee");
  return res.redirect("/account/login");
}
 
/******************************
 * build the upgrades page
 ***************************/
Util.buildUpgradeGrid = async function (upgrades) {
  let grid = '<div class="upgrade-grid">';
    
  upgrades.forEach(upgrade => { 
    let price = "N/A";
    if (upgrade.upgrade_price !== undefined && upgrade.upgrade_price !== null) {
      price = Number(upgrade.upgrade_price).toFixed(2);
    }
  
    grid += `
      <div class="upgrade-card">
        <div class="upgrade-img">
          <img src="${upgrade.upgrade_image}" alt="${upgrade.upgrade_name}">
        </div>
        <h2>${upgrade.upgrade_name}</h2>
        <p>Type: ${upgrade.upgrade_type}</p>
        <p>Price: $${upgrade.upgrade_price}</p>
        <a class="upgrade-button" href="/upgrades/detail/${upgrade.upgrade_id}">View Details</a>
      </div>
    `;
  });

  
  grid += '</div>';
  return grid;
}

/******************************
 * Build the upgrades detial pages
 *****************************/
Util.buildUpgradeDetail = async function (upgrade) {
  let details = '<div class="upgrade-details">';
    details += `
      <img src="${upgrade.upgrade_image}" alt="${upgrade.upgrade_name}"><br>
      <div class="upgrade-detail-info">
        <p>Type: ${upgrade.upgrade_type}</p>
        <p>Description: ${upgrade.upgrade_description}</p>
        <p>Price: $${upgrade.upgrade_price}</p>
        <a href="/upgrades/type/${upgrade.upgrade_type_id}">Back to Upgrades</a>
      </div>
    `;
  details += '</div>';
  return details;
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
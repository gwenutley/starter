const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

//trigger 500 error
baseController.causeError = (req, res, next) => {
  try {
    throw new Error("500 error")
  } catch (error) {
    next(error)
  }
}

module.exports = baseController

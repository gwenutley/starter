const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()

  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* **************************
  * get the URL and use it's ID to get vehicle data
  * ***********************  */
invCont.buildVehicleInventory = async function (req, res, next) {
  try {
    const invID = req.params.vehID
    const data = await invModel.getVehicleById(invID)

    if (!data || data.length === 0) {
      return next({ status: 404, message: "Vehicle not found" });
    }

    const vehicle = data[0]
    const vehicleHTML = await utilities.buildVehicleDetail(vehicle)
    const nav = await utilities.getNav()
    const title = `${vehicle.inv_make} ${vehicle.inv_model} ${vehicle.inv_year}`

    res.render("./inventory/detail", {
      title,
      nav,
      vehicleHTML,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont
  





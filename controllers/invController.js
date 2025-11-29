const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  
  if (!data || data.length === 0) {
    return next({status: 404, message: "No vehicles found in this classification"})
  }

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

/***********************
 * build the management view
 ***********************/
invCont.buildManagementView = async function (req, res, next) {
  try {
    //get nav
    const nav = await utilities.getNav()
    const title = "Inventory Management"
    const message = req.flash("notice") || "";
    const classificationSelect = await utilities.buildClassificationList()

    res.render("./inventory/management", {
      title,
      nav,
      message,
      classificationSelect
    })
  } catch (error) {
    next(error)
  }
}

/*****************
 * build the add classification form
 ********************/
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const title = "Add Classification";
    const message = req.flash("notice") || "";
    const errors = [];

    res.render("./inventory/add-classification", {
      title,
      nav,
      message,
      errors,
      classification_name: "",
    })
  } catch (error) {
    next(error)
  }
}


/****************************
 * handle the add classification form submission
 ****************************/
invCont.addClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const title = "Add Classification"
    const { classification_name } = req.body

    //server side validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).render("./inventory/add-classification", {
        title,
        nav,
        message: "",
        errors: errors.array(),
        classification_name,
      })
    }
  

    const result = await invModel.addClassification(classification_name)

    if (result.rowCount === 1) {
      req.flash("notice", `Successfully added classification: ${classification_name}`)
      return res.redirect("/inv")
    } else {
      req.flash("notice", `Failed to add classification.Please try again.`)
      return res.status(500).render("./inventory/add-classification", {
        title,
        nav,
        message: "",
        errors: [],
        classification_name,
      })
    } 
  } catch (error) {
      next(error)
  }
}

/*************************
 * build the add inventory form
 **********************/
invCont.buildAddInventory = async function(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList();
    const message = req.flash("notice") || "";
    const errors = [];

    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      message,
      errors: [],
      classificationSelect,
      classification_id: "",
      inv_make:"",
      inv_model:"",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: "",
    });
  } catch (error) {
    next(error)
  }
}


/****************************
 * Handle Add Inventory POST
 ****************************/
invCont.addInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    const errors = validationResult(req)

    let {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    } = req.body

    if (!inv_image) inv_image = "/images/vehicles/no-image.png";
    if (!inv_thumbnail) inv_thumbnail = "/images/vehicles/no-image-tn.png";

    if (!errors.isEmpty()) {
      return res.status(400).render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: errors.array(),
        message: "",
        classificationSelect,
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
      })
    }

    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    })

    if (result.rowCount === 1) {
      req.flash("notice", `${inv_make} ${inv_model} added successfully!`)
      return res.redirect("/inv")
    }

    req.flash("notice", "Inventory item failed to add.")
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: [],
      message: req.flash("notice"),
      classificationSelect,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData.length > 0) {
      return res.json(invData)
  } else {
      return res.status(404).json({ error: "No data returned" })
  }
}


/* ********************
*Build view to modify inventory
**************************/
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const data = await invModel.getVehicleById(inv_id)
  const itemData = data[0]
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    const updateResult = await invModel.updateInventory(
      inv_id,  
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      })
    }
  } catch (error) {
    console.error("Update Inventory Error: ", error)
    next(error)
  }
}


module.exports = invCont
  





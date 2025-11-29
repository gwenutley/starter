const utilities = require(".")
const invModel = require("../models/inventory-model")

const { body } = require("express-validator")

/*****************************
 * validate the add inventory rules
 *********************************/
const addInventoryRules = [
  body("inv_make")
    .trim()
    .notEmpty()
    .withMessage("Make is required.")
    .escape(),

  body("inv_model")
    .trim()
    .notEmpty()
    .withMessage("Model is required.")
    .escape(),
  
  body("inv_description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .escape(),
  
  body("inv_year")
    .isInt({min: 1900, max: new Date().getFullYear() + 1})
    .withMessage("Enter valid year."),
  
  body("inv_price")
    .isFloat({min: 0})
    .withMessage("Enter a valid price."),
  
  body("inv_miles")
    .isInt({min: 0})
    .withMessage("Miles must be positive"),
  
  body("inv_color")
    .trim()
    .notEmpty()
    .withMessage("Color is required.")
    .escape(),

  body("classification_id")
    .notEmpty()
    .withMessage("Classification is required")
    .isInt()
    .withMessage("Classificationm must be a valid ID"),
  
    body("inv_image")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),

  body("inv_thumbnail")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),
]



/*****************************
 * validate the edit inventory 
 *********************************/
const checkUpdateData = [
  body("inv_id")
    .trim()
    .notEmpty()
    .withMessage("inventory ID is required")
    .isInt()
    .withMessage("Inventory ID must be a number"),
  
  body("inv_make")
    .trim()
    .notEmpty()
    .withMessage("Make is required.")
    .escape(),

  body("inv_model")
    .trim()
    .notEmpty()
    .withMessage("Model is required.")
    .escape(),
  
  body("inv_description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .escape(),
  
  body("inv_year")
    .isInt({min: 1900, max: new Date().getFullYear() + 1})
    .withMessage("Enter valid year."),
  
  body("inv_price")
    .isFloat({min: 0})
    .withMessage("Enter a valid price."),
  
  body("inv_miles")
    .isInt({min: 0})
    .withMessage("Miles must be positive"),
  
  body("inv_color")
    .trim()
    .notEmpty()
    .withMessage("Color is required.")
    .escape(),

  body("classification_id")
    .notEmpty()
    .withMessage("Classification is required")
    .isInt()
    .withMessage("Classification must be a valid ID"),
  
    body("inv_image")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),

  body("inv_thumbnail")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),
]


module.exports = { addInventoryRules, checkUpdateData }
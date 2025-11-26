const utilities = require(".")
const invModel = require("../models/inventory-model")

const { body } = require("express-validator")

/*****************************
 * validate the add classification, can't be empty and only contain letters and numbers
 *********************************/
const addClassificationRules = [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name cannot contain spaces or special characters."),
]

module.exports = { addClassificationRules }
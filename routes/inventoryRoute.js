// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const validateClass = require("../utilities/classification-validation");
const validateInventory = require("../utilities/inventory-validation");
const { checkAdminEmployee } = utilities;

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle details page
router.get("/detail/:vehID", utilities.handleErrors(invController.buildVehicleInventory));

//Route to build the management page
router.get("/", checkAdminEmployee, utilities.handleErrors(invController.buildManagementView));

//route to display the new classification form
router.get("/add-classification", checkAdminEmployee, utilities.handleErrors(invController.buildAddClassification));


//route to sumbit the new classification form
router.post(
    "/add-classification",
    checkAdminEmployee,
    validateClass.addClassificationRules,
    utilities.handleErrors(invController.addClassification)
);

//route to display the new inventory form
router.get("/add-inventory", checkAdminEmployee, utilities.handleErrors(invController.buildAddInventory));

//route to submit the new inventory form
router.post(
    "/add-inventory",
    checkAdminEmployee,
    validateInventory.addInventoryRules,
    utilities.handleErrors(invController.addInventory)
);

//route to the inventory Javascript to display list of inventory
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

//route to the modify link
router.get("/edit/:inv_id", checkAdminEmployee, utilities.handleErrors(invController.editInventoryView));

//route to update the inventory from the modify form
router.post("/update/", checkAdminEmployee, validateInventory.addInventoryRules, validateInventory.checkUpdateData, utilities.handleErrors(invController.updateInventory));


module.exports = router;


// Needed Resources
const express = require("express")
const router = new express.Router()
const upgradeController = require("../controllers/upgradeController")
const utilities = require("../utilities/")

// Route to build upgrades by type view
router.get("/type/:typeId", utilities.handleErrors(upgradeController.buildByTypeId))

// Route to build upgrade detail page
router.get("/detail/:upgradeId", utilities.handleErrors(upgradeController.buildUpgradeDetail))

module.exports = router;
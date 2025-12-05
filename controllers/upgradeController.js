const upgradeModel = require("../models/upgrade-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")

const upgradeCont = {}

/* ***************************
 *  Build upgrades by type view
 * ************************** */
upgradeCont.buildByTypeId = async function (req, res, next) {
  try {
    const type_id = parseInt(req.params.typeId)

    if (isNaN(type_id)) {
      return next({ status: 400, message: "Invalid upgrade type ID" })
    }

    const data = await upgradeModel.getUpgradesByTypeId(type_id)

    if (!data || data.length === 0) {
      return next({ status: 404, message: "No upgrades found for this type" })
    }

    const grid = await utilities.buildUpgradeGrid(data)
    const nav = await utilities.getNav()
    const typeName = data[0].upgrade_type
      
    res.render("./upgrades/type", {
      title: typeName + " Upgrades",
      nav,
      grid,
      message: null
    })
  } catch (error) {
    next(error)
  }
}

/* **************************
 *  Build upgrade detail view
 * ************************** */
upgradeCont.buildUpgradeDetail = async function (req, res, next) {
  try {
    const upgrade_id = parseInt(req.params.upgradeId)

    if (isNaN(upgrade_id)) {
      return next({ status: 400, message: "Invalid upgrade ID" })
    }

    const data = await upgradeModel.getUpgradeById(upgrade_id)

    if (!data || data.length === 0) {
      return next({ status: 404, message: "Upgrade not found" })
    }

    const upgrade = data[0];
    const upgradeHTML = await utilities.buildUpgradeDetail(upgrade) 
    const nav = await utilities.getNav()
      const title = upgrade.upgrade_name;

    res.render("./upgrades/detail", {
      title,
      nav,
      upgradeHTML,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = upgradeCont
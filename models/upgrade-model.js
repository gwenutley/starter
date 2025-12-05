const pool = require("../database/")

/* ***************************
 *  Get all upgrades by type ID
 * ************************** */
async function getUpgradesByTypeId(type_id) {
  try {
    const data = await pool.query(
      `SELECT * 
       FROM public.upgrades
       WHERE upgrade_type_id = $1
       ORDER BY upgrade_name`,
      [type_id]
    )
    return data.rows
  } catch (error) {
    console.error("getUpgradesByTypeId error: " + error)
    throw error
  }
}

/* ***************************
 *  Get one upgrade by upgrade ID
 * ************************** */
async function getUpgradeById(upgrade_id) {
  try {
    const data = await pool.query(
      `SELECT * 
       FROM public.upgrades
       WHERE upgrade_id = $1`,
      [upgrade_id]
    )
    return data.rows
  } catch (error) {
    console.error("getUpgradeById error: " + error)
    throw error
  }
}

module.exports = {
  getUpgradesByTypeId,
  getUpgradeById
}
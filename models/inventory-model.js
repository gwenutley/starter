const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error: " + error)
    throw error
  }
}

/* *************************
  *get one vehicle using its inv_id
 ************************ */
async function getVehicleById(invID) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [invID]
    )
    return data.rows
  } catch (error) {
    console.error("getvehiclebyid error: " + error)
    throw error
  }
}

/***********************
 * add a new classification to the database classification table
 * ********************/
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING *;
    `

    const values = [classification_name]

    const result = await pool.query(sql, values)
    return result
  } catch (error) {
    console.error("Error in invModel.addClassification:", error)
    throw error
  }
}


/**************************
 * add new inventory to a classsification in the database
 ***************************/
async function addVehicle(vehicleData) {
  const sql = `
    INSERT INTO public.inventory
    (inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color, inv_description, inv_image, inv_thumbnail, classification_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [
    vehicleData.inv_make,
    vehicleData.inv_model,
    vehicleData.inv_year,
    vehicleData.inv_price,
    vehicleData.inv_miles,
    vehicleData.inv_color,
    vehicleData.inv_description,
    vehicleData.inv_image || '/images/vehicles/no-image.png',
    vehicleData.inv_thumbnail || '/images/vehicles/no-image-tn.png',
    vehicleData.classification_id,
  ]

  return await pool.query(sql, values);
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
    throw error
  }
}


module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory: addVehicle, updateInventory};
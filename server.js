/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const parser = require("body-parser")
const cookieParser = require("cookie-parser")

//use public files statically
app.use(express.static("public"));


//cookie parser and jwt middleware
//check loogedin and account data
app.use(cookieParser())
app.use(utilities.checkJWTToken)
app.use((req, res, next) => {
  res.locals.loggedin = res.locals.loggedin || 0
  res.locals.accountData = res.locals.accountData || {}
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.set("views", "./views")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") 



/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//upgrade details pages
app.use("/upgrades", require("./routes/upgradeRoute"));

//make the body-parser available to application
app.use(parser.json())
app.use(parser.urlencoded({extended: true})) 





/* ***********************
 * Routes
 *************************/
//app.use(require("./routes/static"))
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

//static route
app.use(static)
// Inventory routes
app.use("/inv", inventoryRoute);
//account route
app.use("/account", require("./routes/accountRoute"));
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else message = err.message || "Oh no! There was a crash try another route"
  
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "0.0.0.0"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "localhost" : host
  console.log(`app listening on ${displayHost}:${port}`)
})

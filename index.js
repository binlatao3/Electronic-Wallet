require('dotenv').config()
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const path  = require("path")

// Model
const Users = require('./model/users')

// db
const db = require('./db')

// routers
const usersRouter = require('./routers/user')
const adminRouter = require('./routers/admin')

const app = express()

app.engine('handlebars', expressHandlebars.engine())
app.use(express.urlencoded({extended : false}))
app.use(cookieParser('CUOIKY'));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "secret",
}));  
app.use(flash());
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'handlebars')

// use Router
app.use('/', usersRouter)
app.use('/admin', adminRouter)


const port = process.env.PORT || 3000
app.listen(port, console.log(
    "\nUser" 
    + `\nhttp://localhost:${port}`
    + `\nhttp://localhost:${port}/login`
    + `\nhttp://localhost:${port}/register`
    + "\n\nAdmin" 
    + `\nhttp://localhost:${port}/admin/activated`
    + `\nhttp://localhost:${port}/admin/login`
    ))


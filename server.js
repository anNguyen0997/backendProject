const express = require('express');
const app = express();

const { Sequelize } = require('sequelize');
const { users,stats,index } = require('./models')
const sequelize = new Sequelize('postgres://postgres:testing1234xA@localhost:5432/wes_database')

app.use(express.json())
app.set('view engine', 'ejs')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/login', (req, res)=> {
    res.render("login")
})

app.get('/register', (req, res)=> {
    res.render("register")
})



app.listen(3000, console.log('Server running on port 3000'))

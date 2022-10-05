const express = require('express');
const app = express();

const { Sequelize } = require('sequelize');
const { users,stats,index } = require('./models')
const sequelize = new Sequelize('postgres://postgres:testing1234xA@localhost:5432/wes_database')

app.use(express.json())
app.set('view engine', 'ejs')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

// login to get existing user(s)
app.get('/login', async(req, res)=> {   
    res.render("login")

    let loggedUsers = await users.findOne({
        where: {
            username: req.body.username,
            password: req.body.password
        }
    })
    if (loggedUsers == null) {
        res.statusCode = 400
        res.send('this user does not exist')
    } else {
        res.redirect('/stats')
    }
})


app.get('/register', (req, res)=> {
    res.render("register")
})

app.post('/register', async (req, res) => {
    let userExists = await users.findAll({
        where: {
            username: req.body.username,
            email: req.body.email
        }
    })
    if (userExists != null) {
        res.statusCode = 400
        res.send('This user already exists')
    } else {
        await users.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
        })
        res.redirect('/login')
    }
})

app.listen(3000, console.log('Server running on port 3000'))

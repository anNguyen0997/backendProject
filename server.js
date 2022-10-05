const express = require('express');                                                         // Initializes express
const app = express();

const { Sequelize } = require('sequelize');                                                 // Initializes sequelize
const { users,stats } = require('./models')                                                 // Initializes models
const sequelize = new Sequelize('postgres://jonathanbatalla@localhost:5432/postgres')       // Connects to database

app.use(express.json())                                                                     // Allows use of Json objects
app.set('view engine', 'ejs')                                                               // Allows display of ejs files
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/login', async(req, res)=> {                                                            // Renders Login Page
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

app.get('/register', (req, res)=> {                                                         // Renders Register Page
    res.render("register")
})

function getStats(){
    agents = ['Fade','Neon','Chamber','Skye','Yoru','Astra','KAY/O','Phoenix','Raze',
    'Brimstone','Jett','Sage','Viper','Breach','Cypeher','Sova','Omen','Reyna','Killjoy']
    
    guns = ['Operator','Vandal','Phantom','Classic','Judge','Marshall','Odin','Sheriff',
    'Spectre','Ares','Bulldog','Frenzy','Ghost','Guardian','Bucky','Knife','Shorty','Stinger']

    rank = ['Iron','Bronze','Silver','Gold','Platinum','Diamond','Ascendant','Immortal','Radiant']

    userstats = {
    agent: agents[Math.floor(Math.random()*20)],
    gun: guns[Math.floor(Math.random()*19)],
    rank: rank[Math.floor(Math.random()*10)] + ' ' + Math.ceil(Math.random()*3),
    kd: (Math.random()*3).toFixed(2),
    winRate: Math.floor(Math.random()*101)
    }

    return userstats
}

app.post('/register', async (req, res) => {
    let userExists = await users.findAll({
        where: {
            username: req.body.username,
            email: req.body.email
        }
    })

    res.redirect('/login')
    if (userExists != null) {
        res.statusCode = 400
        res.send('This user already exists')
    } 
    else {
        await users.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
        })

        userstats = getStats()
        userstats['username'] = req.body.username
    
        await stats.create(userstats)


        res.redirect('/login')
    }
})

app.listen(3000, console.log('Server running on port 3000'))

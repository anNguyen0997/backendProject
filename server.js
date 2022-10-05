const express = require('express');                                                         // Initializes express
const app = express();

const { Sequelize } = require('sequelize');                                                 // Initializes sequelize
const { users,stats } = require('./models')                                                 // Initializes models
const sequelize = new Sequelize('postgres://jonathanbatalla@localhost:5432/postgres')       // Connects to database

app.use(express.json())                                                                     // Allows use of Json objects
app.set('view engine', 'ejs')                                                               // Allows display of ejs files
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/login', async(req, res)=> {                                                        // Renders Login Page
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
        res.redirect('/stats/'+ req.body.username)
    }
})

app.get('/register', (req, res)=> {                                                         // Renders Register Page
    res.render("register")
})

app.get('/stats/:userName', async (req, res) => {                                           // Renders Stats Page
    let player = await stats.findOne({
        where:{ username: req.params.userName}
    })
    
    res.render("stats",{user: player})                                                      // Sends stats from database to stats.ejs
})

function getStats(){
    agents = ['Fade','Neon','Chamber','Skye','Yoru','Astra','KAY/O','Phoenix','Raze',       // List of all Valorant Agents
    'Brimstone','Jett','Sage','Viper','Breach','Cypeher','Sova','Omen','Reyna','Killjoy']
    
    guns = ['Operator','Vandal','Phantom','Classic','Judge','Marshall','Odin','Sheriff',    // List of all Valorant guns
    'Spectre','Ares','Bulldog','Frenzy','Ghost','Guardian','Bucky','Knife','Shorty','Stinger']

    rank = ['Iron','Bronze','Silver','Gold','Platinum','Diamond','Ascendant','Immortal','Radiant']  //List of all Valorant ranks

    userstats = {                                                                           // Generate random stats for user
    agent: agents[Math.floor(Math.random()*20)],
    gun: guns[Math.floor(Math.random()*19)],
    rank: rank[Math.floor(Math.random()*10)] + ' ' + Math.ceil(Math.random()*3),
    kd: (Math.random()*3).toFixed(2),
    winRate: Math.floor(Math.random()*101)
    }

    return userstats                                                                        // return stats as an object
}

app.post('/register', async (req, res) => {                                                 // Creates user in users table
    let userExists = await users.findAll({
        where: {
            username: req.body.username,
            email: req.body.email
        }
    })

    if (userExists != null) {                                                               // If user does exist do a res.redirct('register',{msg:'user already exist})
        res.statusCode = 400                                                                // and display msg on register page
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

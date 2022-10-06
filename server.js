const express = require('express');                                                         // Initializes express
const app = express();
app.use(express.json())                                                                     // Allows use of Json objects
app.set('view engine', 'ejs')                                                               // Allows display of ejs files

const { Sequelize } = require('sequelize');                                                 // Initializes sequelize
const { users,stats } = require('./models')                                                 // Initializes models
//const sequelize = new Sequelize('postgres://jonathanbatalla@localhost:5432/postgres')     // Connects to database
const sequelize = new Sequelize('postgres://postgres:testing1234xA@localhost:5432/backendBase')


const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

const bcrypt = require('bcrypt');                                                           // Imports package for enrypting passwords
const saltRounds = 10;
const myPlaintextPassword = 's0/4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
//------------------------------------------------------------------------------------------------------------------------
function passwordHasher(userPassword){                                                      // Encrypts the Password
    let passwordHash = bcrypt.hash(userPassword, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        return passwordHash
    });
}
//----------------------------------------------------------
function passwordChecker(password){                                                         // Decrypts the Password
    bcrypt.compare(password, hash, function(err, result) {
        // result == true
    });
}
//----------------------------------------------------------
function getStats(){
    agents = ['Fade','Neon','Chamber','Skye','Yoru','Astra','KAY/O','Phoenix','Raze',       // List of all Valorant Agents
    'Brimstone','Jett','Sage','Viper','Breach','Cypeher','Sova','Omen','Reyna','Killjoy']
    
    guns = ['Operator','Vandal','Phantom','Classic','Judge','Marshall','Odin','Sheriff',    // List of all Valorant guns
    'Spectre','Ares','Bulldog','Frenzy','Ghost','Guardian','Bucky','Knife','Shorty','Stinger']

    rank = ['Iron','Bronze','Silver','Gold','Platinum','Diamond','Ascendant','Immortal']   //List of all Valorant ranks

    userstats = {                                                                           // Generate random stats for user
    agent: agents[Math.floor(Math.random()*20)],
    gun: guns[Math.floor(Math.random()*19)],
    rank: rank[Math.floor(Math.random()*10)] + ' ' + Math.ceil(Math.random()*3),
    kd: (Math.random()*3).toFixed(2),
    winRate: Math.floor(Math.random()*101)
    }

    return userstats                                                                        // return stats as an object
}
//------------------------------------------------------------------------------------------------------------------------
app.get('/register', (req, res)=> {                                                         // Renders Register Page
    res.render("register",{msg:'Hello'})                                                    // Renders register.ejs
})
//----------------------------------------------------------
app.post('/registerUser', async (req, res) => {                                              // Creates user in users table
    
    let userExists = await users.findAll({
        where: {
            username: req.body.username
        }
    })

    if (Object.keys(userExists).length != 0) {                                               // Checks if username exist
        res.render('register',{msg:'User already exist'})
    }
    else {
        
        let userExists = await users.findAll({
            where: {
                email: req.body.email
            }
        })
        
        if (Object.keys(userExists).length != 0) {                                            // Checks if email exist
            res.render('register',{msg:'Email already exist'})
        }
        else {
            await users.create({                                                              // Creates instance in users table
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
            })
    
            userstats = getStats()                                                             
            userstats['username'] = req.body.username
        
            await stats.create(userstats)                                                   // Creates instance in stats table
    
    
            res.redirect('/login')                                                          // redirects to /login
        }   
    } 
    
})
//----------------------------------------------------------
app.get('/login', async(req, res)=> {                                                        // Renders Login Page
    res.render("login")                                                                      // Renders login.ejs
})
//----------------------------------------------------------
app.post('/check', async (req,res) => {                                                     // Called from login.ejs
    console.log(req.body.username)
    console.log('inside check')

    let loggedUser = await users.findOne({
        where: {
            username: req.body.username,
            password: req.body.password
        }
    })

 
    if (loggedUser == null) {                                                               // Checks if user and pass are correct
        res.render('login',{msg:'User does not exist'})
    } 
    else {
        res.redirect('/stats/' + req.body.username)                                         // Redirects to stats/(username of user)
    }    
})
//----------------------------------------------------------
app.get('/stats/:username', async (req, res) => {                                           // Renders Stats Page
    let player = await stats.findOne({
        where: {
            username: req.params.username
        }
    })
    res.render("stats",{user: player})                                                      // Renders stats.ejs and sends stats from database to stats.ejs
})
//------------------------------------------------------------------------------------------------------------------------

app.listen(3000, console.log('Server running on port 3000'))

const express = require('express');                                                         // Initializes express
const app = express();
app.use(express.json())                                                                     // Allows use of Json objects
app.set('view engine', 'ejs')                                                               // Allows display of ejs files
app.use(express.static('public'))
app.use('/css',express.static(__dirname + 'public/css'))
app.use('/assets',express.static(__dirname + 'public/assets'))
app.use('/js',express.static(__dirname + 'public/js'))

app.use(express.static('assets'))

const { Sequelize } = require('sequelize');                                                 // Initializes sequelize
const { users,stats } = require('./models')                                                 // Initializes models
//const sequelize = new Sequelize('postgres://jonathanbatalla@localhost:5432/postgres')     // Connects to database
//const sequelize = new Sequelize('postgres://postgres:testing1234xA@localhost:5432/backendBase')
const sequelize = new Sequelize('postgres://rory@localhost:5432/backendBase')  


const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

const bcrypt = require('bcrypt');                                                           // Imports package for enrypting passwords
const saltRounds = 10;
//------------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------
function getStats(){
    agents = ['Fade','Neon','Chamber','Skye','Yoru','Astra','KAYO','Phoenix','Raze',       // List of all Valorant Agents
    'Brimstone','Jett','Sage','Viper','Breach','Cypeher','Sova','Omen','Reyna','Killjoy']
    
    guns = ['Operator','Vandal','Phantom','Classic','Judge','Marshall','Odin','Sheriff',    // List of all Valorant guns
    'Spectre','Ares','Bulldog','Frenzy','Ghost','Guardian','Bucky','Knife','Shorty','Stinger']

    rank = ['Iron','Bronze','Silver','Gold','Platinum','Diamond','Ascendant','Immortal']   //List of all Valorant ranks

    userstats = {                                                                           // Generate random stats for user
    agent: agents[Math.floor(Math.random()*20)],
    gun: guns[Math.floor(Math.random()*19)],
    rank: rank[Math.floor(Math.random()*9)] + ' ' + Math.ceil(Math.random()*3),
    kd: (Math.random()*3).toFixed(2),
    winRate: Math.floor(Math.random()*101)
    }

    return userstats                                                                        // return stats as an object
}
//------------------------------------------------------------------------------------------------------------------------
app.get('/register', (req, res)=> {                                                         // Renders Register Page
    res.render("register",{msg:'Join the battle'})                                                    // Renders register.ejs
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
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)                   // Hashes user password for database
            await users.create({                                                              // Creates instance in users table
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                password: hashedPassword,
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
app.post('/stats', async (req,res) => {                                                     // Called from login.ejs
   
    let loggedUser = await users.findOne({
        where: {
            username: req.body.username,
        }
    })
 
    if (loggedUser == null) {                                                               // Checks if user and pass are correct
        res.render('login',{msg:'User does not exist'})
    } 
    else {
        try {
            if (await bcrypt.compare(req.body.password, loggedUser.password)) {                  //Checks password from dataBase
            //   res.redirect('/stats/' + req.body.username)                                     //Redirects to stats/(username of user)
            let player = await stats.findOne({
                where: {
                    username: req.body.username
                }
            })
            res.render("stats",{user: player})                                                  // Renders stats.ejs and sends stats from database to stats.ejs
    
            } 
            else {
              res.send('Not Allowed')
            }
          } 
          catch {
            res.status(500).send()
        }
    }
})
//------------------------------------------------------------------------------------------------------------------------

app.listen(3000, console.log('Server running on port 3000'))

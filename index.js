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

const sequelize = new Sequelize('postgres://postgres:testing1234xA@localhost:5432/backendBase')

//const sequelize = new Sequelize('postgres://wenhwzxhzxocxo:dc1b6e72a92c00a43814a461ab66e834f01da5260663128e5765def101f4c274@ec2-3-93-206-109.compute-1.amazonaws.com:5432/d2ejtutdcnmsab')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

const bcrypt = require('bcrypt');                                                           // Imports package for enrypting passwords
const saltRounds = 10;
//------------------------------------------------------------------------------------------------------------------------
function lettersAndNumbersCheck(word){
    if(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(word)){
        console.log("this password contains both numbers and letters 8min 20max ")
        return true 
    }
    else{
        console.log("password was not good")
        return false
    }
}
function lengthCheck(item, minLength, maxLength){                                           // checks the length of what is passed in
    let itemLength = item.length;
    if(itemLength < minLength){
        console.log(item+" is too short")
        return false
    }
    else if(itemLength > maxLength){
        console.log(item+" is too long")
        return false
    }
    else{
        return true
    }
}
function lettersOnly(word){
    if (!/[^a-zA-Z]/.test(word)){
        return true
    }
    else{
        return false
    }
}
function validateEmail(mail){
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)&&lengthCheck(mail,5,30)==true){          //checks to make sure email is valid and long enough
        return (true)
    }
    else{
        return (false)
    }
}

//----------------------------------------------------------
function getStats(){
    agents = ['Fade','Neon','Chamber','Skye','Yoru','Astra','KAYO','Phoenix','Raze',       // List of all Valorant Agents
    'Brimstone','Jett','Sage','Viper','Breach','Cypher','Sova','Omen','Reyna','Killjoy']
    
    guns = ['Operator','Vandal','Phantom','Classic','Judge','Marshal','Odin','Sheriff',    // List of all Valorant guns
    'Spectre','Ares','Bulldog','Frenzy','Ghost','Guardian','Bucky','Knife','Shorty','Stinger']

    rank = ['Iron','Bronze','Silver','Gold','Platinum','Diamond','Ascendant','Immortal']   //List of all Valorant ranks

    userstats = {                                                                           // Generate random stats for user
    agent: agents[Math.floor(Math.random()*19)],
    gun: guns[Math.floor(Math.random()*18)],
    rank: rank[Math.floor(Math.random()*8)] + ' ' + Math.ceil(Math.random()*3),
    kd: (Math.random()*3 + .01).toFixed(2), 
    winRate: Math.floor(Math.random()*100) + 1
    }

    return userstats                                                                        // return stats as an object
}
//------------------------------------------------------------------------------------------------------------------------
app.get('/', (req, res)=> {                                            
    res.render("home")                                                   
})
//----------------------------------------------------------
app.get('/register', (req, res)=> {                                                         // Renders Register Page
    res.render("register",{msg:'Join the battle'})                                          // Renders register.ejs
})
//----------------------------------------------------------
app.post('/register', async (req, res) => {                                              // Creates user in users table
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
       
        if(Object.keys(userExists).length != 0 || validateEmail(req.body.email)==false) {      // Checks if email exist & checks to see if it is a valid email
            if(validateEmail(req.body.email)==false){
                res.render('register',{msg:'Email must be > 5 characters < 30 char long and have @ symbol.'})}
            else{
                res.render('register',{msg:'Email already exist'})}
        }
        else if(req.body.confirmPassword != req.body.password){
            res.render('register',{msg:"Please make sure both passwords you have entered match."})
        }
        else if(lettersOnly(req.body.firstname)==false||lettersOnly(req.body.lastname)==false||lettersOnly(req.body.username)==false){ 
            res.render('register',{msg:"Use only letters in first name,last name and username"})
        }
        else if(lengthCheck(req.body.firstname,2,15)==false||lengthCheck(req.body.lastname,2,15)==false||lengthCheck(req.body.username,2,15)==false){
            res.render('register',{msg:"First name,last name and username must be between 2 and 15."})
        }
        else if(lengthCheck(req.body.password,8,20)==false){ //password length check min 8 max 20
            res.render('register',{msg:"Password must be greater than characters 8 and less than 20."})
        }
        else if(lettersAndNumbersCheck(req.body.password)==false){
            res.render('register',{msg:"Password must contain both letters and numbers."})
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
    res.render("login",{msg:""})                                                                      // Renders login.ejs
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
    else if(lettersOnly(req.body.username)==false){
        console.log("this is req.body.username"+req.body.username);
        res.render('login',{msg:"Use only letters in username"})
    } 
    else if(lengthCheck(req.body.username,2,15)==false){
        console.log("this is req.body.username"+req.body.username);
        res.render('login',{msg:"Use only letters in username"})
    }
    else if(lengthCheck(req.body.password,8,20)==false){                                   //password length check min 8 max 20
        res.render('login',{msg:"Password must be greater than characters 8 and less than 20."})
    }
    else if(lettersAndNumbersCheck(req.body.password)==false){
        res.render('login',{msg:"Password must contain both letters and numbers."})
    }
    else {
        try {
            if (await bcrypt.compare(req.body.password, loggedUser.password)) {                  //Checks password from dataBase
            let player = await stats.findOne({
                where: {
                    username: req.body.username
                }
            })
            res.render("stats",{user: player})                                                  // Renders stats.ejs and sends stats from database to stats.ejs
    
            } 
            else {
              res.render('login',{msg:"Invalid user name or password."})
            }
          } 
          catch {
            res.status(500).send()
        }
    }
})
//------------------------------------------------------------------------------------------------------------------------

app.listen(process.env.PORT || 3001, console.log('Server running on port 3001'))

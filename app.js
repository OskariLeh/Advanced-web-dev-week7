var express = require('express');
var port = 3000
var passport = require("passport")
var session = require("express-session")
var bcrypt = require("bcryptjs")

const initializePassport = require("./passport-config")

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: "VerySecretHash",
  resave: false,
  saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
initializePassport(passport, getUserByUsername, getUserById)


let users = []
let todos = []

app.post("/api/user/register", checkAuthentication,(req, res, next) => {
  for (let i = 0; i < users.length; i++) {
    if(users[i].username == req.body.username){
      return res.status(400).send("Alredy used")
    }
  }
    
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (err) throw err
      let newUser = {
        id: users.length + 1,
        username: req.body.username,
        password: hash
      }
      users.push(newUser)
      res.send(newUser)
    })
  })
})

app.get("/api/user/list", (req, res, next) => {
  res.send(users)
})

function getUserByUsername(username) {
  return users.find(user => user.username === username)
}

function getUserById(id) {
  return users.find(user => user.id === id)
}

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/")
  } else {
    return next()
  }
}

app.post("/api/user/login",  checkAuthentication ,passport.authenticate("local", {
  successMessage: "Logged in",
  failureMessage: "Failed to login"
}, function(req, res) {
  if (req.isAuthenticated()) {
    return res.status(200)
  } else {
    return res.status(401)
  }
}))


app.get("/api/secret/", (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(200)
  } else {
    return res.status(401)
  }
})

app.post("/api/todos", (req, res, next) => {
  if (!req.isAuthenticated()){
    return res.status(401)
  }
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id == req.session.currentUser.id){
      todos[i].todos.push(req.body.todo)
      return res.send(todos[i])
    }
  }
  let newTodos = {
    id: req.session.currentUser.id,
    todos: [req.body.todo]
  }
  todos.push(newTodos)
  return res.send(newTodos)
})

app.get("/api/todos/list", (req, res, next) => {
  res.send({"todos": todos})
})

app.listen(port, () => {
    console.log("listening on port " + port)
})
const LocalStrategy = require("passport-local").Strategy
var bcrypt = require("bcryptjs")

function initialize(passport, getUserByUsername, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const user = getUserByUsername(username)
        if (user == null) {
            return done(null, false)
        }

        try {
            if (await bcrypt.compare(password, user.password)){
                console.log("logged in")
                return done(null, user)
            } else {
                return done(null, false)
            }
        } catch(e){
            return done(e)
        }
    }

    passport.use(new LocalStrategy(authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}


module.exports = initialize
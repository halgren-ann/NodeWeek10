var express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

var app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { Pool } = require("pg");
const db_url = process.env.DATABASE_URL;
const pool = new Pool({connectionString: db_url});
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("views", "views");
app.set("view engine", "ejs");

// We are going to use sessions
var session = require('express-session');

// set up sessions
app.use(session({
  secret: 'my-super-secret-secret!',
  resave: false,
  saveUninitialized: true
}));

// Setup our routes
app.get('/loginPage', function(req, res) {
    console.log("Received a request for the login page");
    res.render("pages/login");
});
//app.post('/login', handleLogin);
app.post('/login', function(req, res) {
    var username = req.body.username;
    var sql = "SELECT id, hashed_password FROM public.user WHERE username = '"+username+"';";
    pool.query(sql, function(err, db_results) {
        if (err) {
            console.log("There was an error");
            throw err;
        }
        else {
            if (db_results.rows[0]) {
                // Load hash from your password DB.
                var hash = db_results.rows[0].hashed_password;
                var myPlaintextPassword = req.body.user_password;
                bcrypt.compare(myPlaintextPassword, hash, function(err, response) {
                    if(err) {
                        console.log("There was an error" +err.message);
                    }
                    else {
                        if(response){
                            //response == true if they match
                            //add the user_id to the session
                            req.session.user_id = db_results.rows[0].id;
                            res.redirect('/home');
                        }
                        else {
                            //the password is wrong
                            res.redirect('/loginPage');
                        }
                    }
                });
            }
            else {
                //the username was not found in the database
                res.redirect('/loginPage');
            }
        }
    });
});
app.get('/logout', handleLogout);

// This method has a middleware function "verifyLogin" that will be called first
app.get("/home", verifyLogin, function(req, res) {
    console.log("Received a request for the home page");
    res.render("pages/makeCalendar");
});
app.get("/signUp", function(req, res) {
    console.log("Received a request for the sign up page");
    res.render("pages/signUp");
});

// If a user is currently stored on the session, removes it
function handleLogout(request, response) {
	// We should do better error checking here to make sure the parameters are present
	if (request.session.user_id) {
		request.session.destroy();
	}
	response.redirect('/home');
}

// This is a middleware function that we can use with any request
// to make sure the user is logged in.
function verifyLogin(request, response, next) {
	if (request.session.user_id) {
		// They are logged in!
		// pass things along to the next function
		next();
	} else {
		// They are not logged in
        // Redirect to login page
        response.redirect('/loginPage');
	}
}

app.post("/getAllRecipes", function(req, res) {
    console.log("Returning all the recipes");
    var sql = "SELECT (title) FROM public.recipe WHERE user_id = '"+req.session.user_id+"';";
    pool.query(sql, function(err, db_results) {
        if (err) {
            console.log("There was an error");
            throw err;
        }
        else {
            res.json(db_results.rows);
            res.send();
        }
    });
});

app.post("/addrecipe", function(req, res) {
    //get the recipe post data here
    var title = req.body.title;
    //now add it to the database
    var sql = "INSERT INTO public.recipe(user_id, title) VALUES('"+req.session.user_id+"', '"+title+"');";
    pool.query(sql, function(err, db_results) {
        if (err) {
            console.log("There was an error");
            throw err;
        }
        else {
            res.json("It worked!");
            res.send();
        }
    });
});

app.post("/newuser", function(req, res) {
    var firstName = req.body.first_name;
    var lastName = req.body.last_name;
    var username = req.body.username;
    var password = req.body.user_password;
    console.log("Adding a new user");

    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
            console.log("There was an error");
        }
        else {
            // Store new user in DB
            var sql = "INSERT INTO public.user(first_name, last_name, username, hashed_password) VALUES('"+firstName+"', '"+lastName+"', '"+username+"', '"+hash+"');";
            pool.query(sql, function(err, db_results) {
                if (err) {
                    console.log("There was an error");
                    throw err;
                }
                else {
                   //Add them to the session
                   var sql = "SELECT id FROM public.user WHERE username = '"+username+"';";
                    pool.query(sql, function(err, db_results) {
                        if (err) {
                            console.log("There was an error");
                            throw err;
                        }
                        else {
                            req.session.user_id = db_results.rows[0].id;
                            res.redirect('/home');
                        }
                    });
                }
            });
        }
    });
});

app.post("/getPlannedMeal", function(req, res) {
    var object = JSON.parse(req.body.params);
    var day = object.day;
    var meal = object.meal;
    //find if the day has been planned before or not
    var sql = "SELECT id FROM public.plannedday WHERE day='"+day+"' AND user_id = '"+req.session.user_id+"';";
    pool.query(sql, function(err, db_results) {
        if (err) {
            console.log("There was an error");
            throw err;
        }
        else {
            //we're in!
            if(db_results.rows[0]) {
                //This day is already a "plannedday" in the database
                var sql = "SELECT "+meal+"_id FROM public.plannedday WHERE id = "+db_results.rows[0].id+" AND user_id = '"+req.session.user_id+"';";
                pool.query(sql, function(err, db_results) {
                    if (err) {
                        console.log("There was an error");
                        throw err;
                    }
                    else {
                        //else there is a meal planned this day, check for this particular meal
                        if (meal == "breakfast" && db_results.rows[0].breakfast_id == null) {
                            res.json("N/A");
                            res.send();
                        }
                        else if(meal == "lunch" && db_results.rows[0].lunch_id == null) {
                            res.json("N/A");
                            res.send();
                        }
                        else if(meal == "dinner" && db_results.rows[0].dinner_id == null) {
                            res.json("N/A");
                            res.send();
                        }
                        else {
                            //It is planned already! Find the recipe title from it's id
                            var recipeId;
                            if(meal == "breakfast") recipeId = db_results.rows[0].breakfast_id;
                            else if(meal == "lunch") recipeId = db_results.rows[0].lunch_id;
                            else recipeId = db_results.rows[0].dinner_id;
                            var sql = "SELECT title FROM public.recipe WHERE id = '"+recipeId+"';";
                            pool.query(sql, function(err, db_results) {
                                if (err) {
                                    console.log("There was an error");
                                    throw err;
                                }
                                else {
                                    res.json(db_results.rows[0].title);
                                    res.send();
                                }
                            });
                        }
                    }
                });
            }
            else {
                //This day is not planned yet, return "N/A"
                res.json("N/A");
                res.send();
            }
        }
    });

});

app.post("/saveplannedday", function(req, res) {
    console.log("Saving the state of a current planned day or creating a new planned day");
    var object = JSON.parse(req.body.params);
    var day = object.day;
    var meal = object.meal;
    var value = object.value;
    var recipeId = null;
    //get the recipeId
    var sql = "SELECT id FROM public.recipe WHERE title = '"+value+"' AND user_id = '"+req.session.user_id+"';";
    pool.query(sql, function(err, db_results) {
        if (err) {
            console.log("There was an error");
            throw err;
        }
        else {
            recipeId = db_results.rows[0].id;

            //find if the day has been planned before or not
            var sql = "SELECT id FROM public.plannedday WHERE day='"+day+"' AND user_id = '"+req.session.user_id+"';";
            pool.query(sql, function(err, db_results) {
                if (err) {
                    console.log("There was an error");
                    throw err;
                }
                else {
                    //we're in!
                    if(db_results.rows[0]) {
                        //This day is already a "plannedday" in the database, I need to update that day
                        var sql = "UPDATE public.plannedday SET "+meal+"_id = "+recipeId+" WHERE id = "+db_results.rows[0].id+" AND user_id = '"+req.session.user_id+"';";
                        pool.query(sql, function(err, db_results) {
                            if (err) {
                                console.log("There was an error");
                                throw err;
                            }
                            else {
                                //else the update worked
                            }
                        });
                    }
                    else {
                        //This day is not planned yet, I need to insert a new row in the database
                        var sql = "INSERT INTO public.plannedday(user_id, day, "+meal+"_id) VALUES("+req.session.user_id+", '"+day+"', "+recipeId+");";
                        pool.query(sql, function(err, db_results) {
                            if (err) {
                                console.log("There was an error");
                                throw err;
                            }
                            else {
                                //else the insert worked
                            }
                        });
                    }
                }
            });
        }
    });
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
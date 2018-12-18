var express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

var app = express();

/*
const bcrypt = require('bcrypt');
const saltRounds = 10;
*/

const { Pool } = require("pg");
const db_url = process.env.DATABASE_URL;
const pool = new Pool({connectionString: db_url});
var bodyParser = require('body-parser');

/*
app.use(require('morgan')('dev'));
var session = require('express-session');
var FileStore = require('session-file-store')(session);
app.use(session({
  name: 'server-session-cookie-id',
  secret: 'byui project',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));
*/

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("views", "views");
app.set("view engine", "ejs");

app.get("/home", function(req, res) {
    console.log("Received a request for the home page");
    var params = {"array": ["a","b", "c", "d", "e", "f", "g"]}; //JSON
    res.render("pages/makeCalendar", params);
});

app.post("/getAllRecipes", function(req, res) {
    console.log("Returning all the recipes");
    var user_id = req.body.user_id;
    var sql = "SELECT (title) FROM public.recipe WHERE user_id=" + user_id + ";";
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
    var sql = "INSERT INTO public.recipe(user_id, title) VALUES('1', '"+title+"');";
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
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    //also hashed password here
    console.log("Adding a new user");
    /*
    bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
        // Store hash in your password DB.
    });

    // Load hash from your password DB.
    bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
        // res == true
    });
    bcrypt.compare(someOtherPlaintextPassword, hash, function(err, res) {
        // res == false
    });
    */
});

app.post("/getPlannedMeal", function(req, res) {
    var object = JSON.parse(req.body.params);
    var day = object.day;
    var meal = object.meal;
    var user_id = 1;
    //find if the day has been planned before or not
    var sql = "SELECT id FROM public.plannedday WHERE day='"+day+"';";
    pool.query(sql, function(err, db_results) {
        if (err) {
            console.log("There was an error");
            throw err;
        }
        else {
            //we're in!
            if(db_results.rows[0]) {
                //This day is already a "plannedday" in the database
                var sql = "SELECT "+meal+"_id FROM public.plannedday WHERE id = "+db_results.rows[0].id+";";
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
    var user_id = 1;
    //get the recipeId
    var sql = "SELECT id FROM public.recipe WHERE title = '"+value+"';";
    pool.query(sql, function(err, db_results) {
        if (err) {
            console.log("There was an error");
            throw err;
        }
        else {
            recipeId = db_results.rows[0].id;

            //find if the day has been planned before or not
            var sql = "SELECT id FROM public.plannedday WHERE day='"+day+"';";
            pool.query(sql, function(err, db_results) {
                if (err) {
                    console.log("There was an error");
                    throw err;
                }
                else {
                    //we're in!
                    if(db_results.rows[0]) {
                        //This day is already a "plannedday" in the database, I need to update that day
                        var sql = "UPDATE public.plannedday SET "+meal+"_id = "+recipeId+" WHERE id = "+db_results.rows[0].id+";";
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
                        var sql = "INSERT INTO public.plannedday(user_id, day, "+meal+"_id) VALUES("+user_id+", '"+day+"', "+recipeId+");";
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

//In ejs:
//<!--put <%= username %> to echo the username var from javascript. Any javascript can go between <% %>-->
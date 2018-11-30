var express = require('express');

var app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("views", "views");
app.set("view engine", "ejs");

app.get("/", function(req, res) {
    console.log("This is the root");
});

app.get("/home", function(req, res) {
    console.log("Received a request for the home page");
    var params = {}; //JSON
    res.render("pages/home", params);
});

app.get("/groceries", function(req, res) {
    console.log("Returning the whole grocery list");
});

app.get("/mealplan", function(req, res) {
    console.log("Returning the current version of the meal plan");
});

app.get("/getplannedday", function(req, res) {
    var id = req.query.id;
    console.log("Returning the planned day with id = " + id);
});

app.get("/nexttwomeals", function(req, res) {
    console.log("Returning the next two meals");
});

app.get("/allrecipes", function(req, res) {
    console.log("Returning all the recipes");
});

app.get("/recipe", function(req, res) {
    var id = req.query.id;
    console.log("Returning the recipe with id = " + id);
});

app.post("/addrecipe", function(req, res) {
    var title = req.body.title;
    //get the rest of the recipe form data here
    //all the ingredients with the amounts and the text
    console.log("Adding a new recipe");
});

app.post("/newuser", function(req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    //also hashed password here
    console.log("Adding a new user");
});

app.post("/saveplannedday", function(req, res) {
    var date = req.body.date;
    var breakfastId = req.body.breakfastId;
    var lunchId = req.body.lunchId;
    var dinnerId = req.body.dinnerId;
    console.log("Saving the state of a current planned day or creating a new planned day");
});

app.listen(5000, function() {
    console.log("The server is up and listening on port 5000");
});

//In ejs:
//<!--put <%= username %> to echo the username var from javascript. Any javascript can go between <% %>-->
function load() {
    document.getElementsByClassName("highlight")[0].style.backgroundColor = "rgba(255, 153, 153, 0.5)";
    loadRecipes();
    populateDropDownMenus();
}

function populateDropDownMenus() {
    //Get the list of recipes
    var xmlhttp = new XMLHttpRequest ();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var array = JSON.parse(xmlhttp.responseText);
            //Add items to each select element
            for (var j=0; j<((21-(new Date().getDay()))*3); j++) {
                var element = document.getElementById("_"+j);
                //Add each recipe from the database
                for (var i=0; i<array.length; i++) {
                    var option = document.createElement("option");
                    var inputValue = array[i].title;
                    var t = document.createTextNode(inputValue);
                    option.appendChild(t);
                    option.value = inputValue;
                    element.add(option, 1);
                }
                //if there is a planned recipe for this meal in the database already, select that item
                selectCurrentPlan(element);
            }
        }
    }

    xmlhttp.open("POST", "/getAllRecipes");
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send(encodeURI('user_id=' + "1"));
}

function selectCurrentPlan(element) {
    var xmlhttp = new XMLHttpRequest ();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var array = JSON.parse(xmlhttp.responseText);
            if (array == "N/A") {
                //the meal was not planned in the database, do nothing and return
                return;
            }
            else {
                //the meal was planned in the database, select that item
                element.value = array;
            }
        }
    }

    var day = getDayFromId(element.id);
    var meal = document.getElementById(element.id).classList[0];
    var jsonStr = '{"day":"'+day+'", "meal": "'+meal+'"}';

    xmlhttp.open("POST", "/getPlannedMeal");
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send(encodeURI('params='+jsonStr));
}

function getDayFromId(elementId) {
    var day = new Date();
    var offset = parseInt(Number(elementId.substring(1)) / 3);
    day.setDate(day.getDate() + offset);
    var dd = day.getDate();
    var mm = day.getMonth()+1; //January is 0!
    var yyyy = day.getFullYear(); 
    if(mm<10) {
        mm = '0'+mm;
    }
    if(dd<10) {
        dd = '0'+dd;
    }
    var day = mm + '/' + dd + '/' + yyyy;
    return day;
}

function loadRecipes() {
    var xmlhttp = new XMLHttpRequest ();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var array = JSON.parse(xmlhttp.responseText);
            //Add the items to the visible list
            for (var i=0; i<array.length; i++) {
                var li = document.createElement("li");
                var inputValue = array[i].title;
                var t = document.createTextNode(inputValue);
                li.appendChild(t);
                if (inputValue === '') {
                    alert("You must write something!");
                } else {
                    var list = document.getElementById("myUL");
                    list.insertBefore(li, list.childNodes[0]);
                }
                document.getElementById("myInput").value = "";
            }
        }
    }

    xmlhttp.open("POST", "/getAllRecipes");
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send(encodeURI('user_id=' + "1"));
}

function saveChoice(element) {
    //This function is called when a recipe is chosen or changed for breakfast, lunch, or dinner on any day.
    var elementId = element.id;
    var meal = document.getElementById(elementId).classList[0];
    var value = element.value;

    //get the date of the calendar day selected
    var day = getDayFromId(elementId);

    //WITH AJAX
    var xmlhttp = new XMLHttpRequest ();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var array = JSON.parse(xmlhttp.responseText);
        }
    }

    var jsonStr = '{"day":"'+day+'", "meal": "'+meal+'", "value": "'+value+'"}';

    xmlhttp.open("POST", "/saveplannedday");
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send(encodeURI('params='+jsonStr));
}

function addtoDB(text) {
    //WITH AJAX
    var xmlhttp = new XMLHttpRequest ();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var array = JSON.parse(xmlhttp.responseText);
            //Add items to each select element
            for (var j=0; j<((21-(new Date().getDay()))*3); j++) {
                var element = document.getElementById("_"+j);
                //Add the new recipe
                var option = document.createElement("option");
                var inputValue = text;
                var t = document.createTextNode(inputValue);
                option.appendChild(t);
                //option.value = inputValue;
                element.add(option, 1);
            }
        }
    }

    xmlhttp.open("POST", "/addRecipe");
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send(encodeURI('title=' + text));
}

// Create a new list item when clicking on the "Add" button
function newElement() {
    var li = document.createElement("li");
    var inputValue = document.getElementById("myInput").value;
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '') {
      alert("You must write something!");
    } else {
        var list = document.getElementById("myUL");
        list.insertBefore(li, list.childNodes[0]);
        addtoDB(inputValue);
    }
    document.getElementById("myInput").value = "";
}

// Get the input field
var input = document.getElementById("myInput");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Trigger the button element with a click
        document.getElementById("addBtn").click();
    }
});

function selectDashboard() {
    document.getElementById("addRecipeSection").classList.add("hidden");
    document.getElementById("mealPlanningSection").classList.add("hidden");
    if(document.getElementById("dashboardSection").classList.contains("hidden")) {
        document.getElementById("dashboardSection").classList.toggle("hidden");
    }
}

function selectAddRecipe() {
    document.getElementById("dashboardSection").classList.add("hidden");
    document.getElementById("mealPlanningSection").classList.add("hidden");
    if(document.getElementById("addRecipeSection").classList.contains("hidden")) {
        document.getElementById("addRecipeSection").classList.toggle("hidden");
    }
}

function selectPlanMeals() {
    document.getElementById("addRecipeSection").classList.add("hidden");
    document.getElementById("dashboardSection").classList.add("hidden");
    if(document.getElementById("mealPlanningSection").classList.contains("hidden")) {
        document.getElementById("mealPlanningSection").classList.toggle("hidden");
    }
}
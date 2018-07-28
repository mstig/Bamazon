//Required packages, including .env and keys to hide sql password
//Columnify for outputting tables neatly
require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const columnify = require("columnify");

/*keys.js holds the SQL database password from the .env file.
If I'm only using it for 1 item, is there any real reason to use
a separate keys.js file rather than setting the variable to something
like process.env.password straight from the .env file? */
const keys = require("./keys.js");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: keys.sql.password,
    database: "bamazon_db"
});


function showAllItems() {
    connection.query('SELECT * FROM products', function (error, results, fields) {
        if (error) {
            throw error;
        }
        //I store the database info to use it for comparison later with item IDs and prices.
        //Is it better to store the returned data or re-check the database multiple times when they attempt to buy?
        var databaseProducts = results;

        //npm columnify package to format output & adjust column width
        console.log(columnify(databaseProducts, {
            minWidth: 18

        }));
        buyItem(databaseProducts);
    });
}

function buyItem(currentProducts) {
    //Creates an array of all item ids from sql to present as user choices
    //Is there a way to use the currentProducts(returned sql object) to display it without looping?
    //It is an array of objects, can I call the item_id property of every child object without some sort of loop?

    //I tried this:
    // var mapIDs = currentProducts.map(a => a.item_id);
    // but got a lot of async problems trying to plug it in as the choices array
    // I tried a console.log immediately before and after the .map and it printed out in the right order, unlike the async examples we've done in class
    // I have a very tenuous grasp on the whole async/promise thing, I'm assuming it has something to do with callbacks?

    var itemIDs = []; //used to populate inquirer with choices, to minimize possible input error
    for (i = 0; i < currentProducts.length; i++) {
        itemIDs.push("" + currentProducts[i].item_id);
    }
    inquirer.prompt([
        {
            type: "list",
            choices: itemIDs,
            message: "Please select the item ID of your purchase.",
            name: "purchase"
        }
    ]).then(function (answers) {
        //grabs object of purchased item from array where id == customer selection        
        var purchaseItem = currentProducts.filter(item => item.item_id == answers.purchase)[0]; // [0] cause filter() returns array, we want only the 1 obj
        inquirer.prompt([
            {
                message: `Please enter the quantity of ${purchaseItem.item_id}: ${purchaseItem.product_name} you would like to buy. (${purchaseItem.stock_quantity} currently in stock.)`,
                name: "purchaseQuantity"
            }
        ]).then(function (answers) {
            var purchaseQuantity = answers.purchaseQuantity;
            var itemQuant = purchaseItem.stock_quantity;
            if (purchaseQuantity > itemQuant) {
                console.log("Sorry, there are not enough items in stock to fulfill that order.");
                connection.end();
            }
            else if (purchaseQuantity <= itemQuant) {
                var total = (purchaseQuantity * purchaseItem.price).toFixed(2); //toFixed to show cents decimal places even if 0
                console.log("Your total is: $" + total);
                //update SQL
                var leftover = purchaseItem.stock_quantity - purchaseQuantity;
                updateQuantity(leftover, purchaseItem.item_id);
                //end connection
                connection.end();
            }
        });
    });
}

function updateQuantity(numLeft, id) {
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: numLeft
            },
            {
                item_id: id
            }
        ], function (error) {
            if (error) {
                console.log(error)
            }
            else {
                console.log(`Quantity updated, ${numLeft} remaining.`);
            }
        });
}





connection.connect(function (err) {
    if (err) {
        console.log("Error: " + err);
    }
    else {
        //call the starting display functions and progress from here
        showAllItems();
    }
});

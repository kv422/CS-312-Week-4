//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//create new db
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});

//create items schema
const itemsSchema = {
  name: String
};

//create new model
const Item = mongoose.model("Item", itemsSchema);

//create new documents
const item1 = new Item ({
  name: "Welcome to your todo List!"
});

const item2 = new Item ({
  name: "Hit + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

//add documents into an array
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];



app.get("/", function(req, res) {
/*const day = date.getDate();
  res.render("list", {listTitle: day, newListItems: items});
});
*/

//log all items

  Item.find({}).then(function(foundItems){
    if(foundItems.length ===0) {
      //insert items
      Item.insertMany(defaultItems).then(function(){
      console.log("Successful DB insert.");
      }).catch(function(err){
      console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
});

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundList){
    console.log("Successful DB insert.");
    if(!foundList){
      //create new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);

    }
    else {
      //show existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    }).catch(function(err){
    console.log(err);
    });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  //new item document
  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
  });
}

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndDelete(checkedItemId);
    res.redirect("/");
  }
  else {
    //find then update to delete
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}}).then(function(foundList){
      res.redirect("/" + listName);
  });
  }
});


//dynamic route
/*
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});
*/

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

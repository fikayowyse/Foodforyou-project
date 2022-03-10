const http = require ('http');
var path = require ('path')
var fs = require ("fs");
const express = require("express");
const app = express();
const port = process.env.PORT || 5100

////Middleware #1: Parse the request Parameters
app.use(express.json())

//Connect to the database
const MongoClient = require('mongodb').MongoClient;

let db;
MongoClient.connect('mongodb+srv://FO348:fikayo@cluster0.o2kjn.mongodb.net/CW2Petdepot?retryWrites=true&w=majority', 
(err, client)=> {
 db = client.db('CW2Petdepot')
});

//Logger Middleware #1
app.use(function (request, response, next) {
    console.log("In comes a request to get the collection name: " + request.url);
    next();
});

////Middleware #2: GET the collection name
app.param('collectionName', (request, response, next, collectionName) => {
    request.collection = db.collection(collectionName)
    return next()
});

//Core issue
app.use(function(request, response, next){
    response.header("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next()
})  

//Logger Middleware #2
app.use(function (request, response, next) {
    console.log("In comes a request to get all the lessons or users in the database : " + request.url);
    next();
});
////Middleware #3: Retrive all lessons or users in a collection
app.get('/collection/:collectionName', (request, response, next) => {
    request.collection.find({}).toArray((e,results) => {
        response.send(results)
    })
});

//Logger Middleware #3
app.use(function (request, response, next) {
    console.log("In comes a request to post a lesson or order Information to our database : " + request.url);
    next();
});
//Middleware #4
app.post('/collection/:collectionName', (request, response, next ) => {
    request.collection.insert(request.body, (e, results) => {
        if(e) return  next(e)
        response.send(results.ops)
    })
});

//Logger Middleware #4
app.use(function (request, response, next) {
    console.log("In comes a request to retrive a specific Order information or lesson form our database: " + request.url);
    next();
});

const ObjectId = require('mongodb').ObjectId

//Middleware #5
app.get('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.findOne({_id: new ObjectId(request.params.id)}, (e, result) => {
        response.send(result)
    })
});

//Logger Middleware #5
app.use(function (request, response, next) {
    console.log("In comes a request to update a specfic Order information or lesson in our database: " + request.url);
    next();
});
//Middleware #6
app.put('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.updateOne(
        {
            _id: new ObjectId(request.params.id)
        },
        {$set: request.body},
        {safe: true, multi: false},

        (e, result) => {
            if (e) return next(e)
            response.send("successfull")
        }
    )
}); 

//Logger Middleware #6
app.use(function (request, response, next) {
    console.log("In comes a request to delete a specific Order information or Lesson in our database: " + request.url);
    next();
});

//Middleware #7: Delete a user or lesson from our database
app.delete('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.deleteOne(
        {
            _id:ObjectId(request.params.id)
        },
        (e, results) => {
            if (e) return next (e)
            response.send("Successful!!!")
        }
    )
});

/* //Logger Middleware #7
app.use(function (request, response, next) {
    console.log("In comes a request to fetch a lesson image form our database: " + request.url);
    next();
});
////Middleware #8: fetch Lesson Images
app.use('/collection/:collectionName/',  function (request, response, next) {
    var filePath = path.join(request.url);
    fs.stat(filePath, function (err, fileInfo){
        if (err) {
            next();
            return;
        }
        if(fileInfo.isFile()) response.sendFile(filePath);
        else {
            next();
        }
    })
})
////Middleware #9: Error messages
app.use(function (request, response) {
    response.status(404);
    //Send the error "File not Found, if the file is not found"
    response.send("The File not Found");
}) */

app.listen(port);
console.log('server running on port');
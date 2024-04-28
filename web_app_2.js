var http = require('http');
var url = require('url');
var port = process.env.PORT || 3000;
//var port = 8080;   //uncomment to run local
// console.log("zips.csv file uploaded to Mongo");
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  urlObj = url.parse(req.url,true)
  id = urlObj.query.id
   res.write("<h2>Problem Set 3-4 Web App 2</h2>");
  res.write("Success: Web App Running.");
  // res.write ("The id is: " + id)
   res.end();
  console.log('hey')
}).listen(port);

const MongoClient = require('mongodb').MongoClient;
const mongo_url = "mongodb+srv://dbuser2:dbUser123@cluster0.toauqqw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const express = require('express');
const app = express();
app.use(express.urlencoded());
client = new MongoClient(mongo_url);

function firstCharIsNumber(inputVar) {
   var firstChar = inputVar.charAt(0);
   return !isNaN(firstChar);
}

app.get('/', function(request, response, next){
	response.send(`
      <form method="POST" action="/">
         <div class="mb-3">
            <label>Type in a city or zip code:</label>
            <input type="text" name="location" id="city" class="form-control" />
         </div>
         <div class="mb-3">
               <input type="submit" name="submit_button" class="btn btn-primary" value="Submit" />
         </div>
      </form>
   `);
});

app.post('/', function(request, response, next){

   var location = request.body.location;
   var val = "";
   var responseString = `
                           <!DOCTYPE html>
                           <html>
                           <head>
                              <title>Process View</title>
                           </head>
                           <body>
                              <p>You entered 
                        `;
   var endResponseString = `
                           </body>
                           </html>
                           `;
   try {
      client.connect();
      var dbo = client.db("problemset3-4");
      var collection = dbo.collection('places');

      var theQuery;
      if (firstCharIsNumber(location)) {
         theQuery = {zipcode: location};
         theFields = {city:1, zipcode:1};
      } else {
         theQuery = {city: location};
         theFields = {zipcode:1};
      }
      val = collection.find(theQuery, theFields).toArray(function(err, items) {
         if (err) {
            console.log("Error: " + err);
            return "error";
         } else {
            if (firstCharIsNumber(location)) {
               responseString += request.body.location + `.</p><p>Here's the city associated with ` + request.body.location + `: ` + items[0].city + `.</p>`;
               if (items[0].zipcode.length > 1) {
                  responseString += `<p>Other ZIP codes of ` + items[0].city + ` include:</p>`;
                  responseString += `<ul>`;
                  for (i=0; i<items[0].zipcode.length; i++) {
                     if (items[0].zipcode[i] != location) {
                        responseString += `<li>` + items[0].zipcode[i] + `</li>`;
                     }
                  }
               }
               responseString += endResponseString;
               response.send(responseString);
            } else {
               if (items[0].zipcode.length > 2) {
                  responseString += request.body.location + `.</p><p>Here are the ZIP codes associated with ` + request.body.location + `:` + `</p>`;
               } else if (items[0].zipcode.length == 1) {
                  responseString += request.body.location + `.</p><p>Here's the ZIP code associated with ` + request.body.location + `:` + `</p>`;
               }
               responseString += `<ul>`;
               if (items[0].zipcode.length > 1) {
                  for (i=0; i<items[0].zipcode.length; i++) {
                     if (items[0].zipcode[i] != location) {
                        responseString += `<li>` + items[0].zipcode[i] + `</li>`;
                     }
                  }
               } else {
                  responseString += `<li>` + items[0].zipcode[0] + `</li>`;
               }
               responseString += `</ul>`;
               responseString += endResponseString;
               response.send(responseString);
            }
         }
      })
   }
   catch (err) {
      console.log("Database error: " + err);
   }
});


app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

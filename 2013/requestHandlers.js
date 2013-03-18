//requestHandlers.js

//get modules
var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable"),
    requestHelpers = require('./requestHelpers');


//
function Home(response, request, collection, url) {
  console.log("\nRequest handler for 'Home' called.");
  var FieldQuery = url.parse(request.url,true).query;

  if(!FieldQuery.hasOwnProperty('Event'))
  {
    fs.readFile('./Home.html', function (err, html) 
    {
      if(err)
      {
         response.writeHead(404, {"Content-Type": "text/plain"});
         response.write(error + "\n");
         response.end();
      }
      else 
      {
        response.writeHead(200, {"Content-Type": "text/html"});       
        response.write(html);
        response.end();
        console.log('loading Home Page');
      }
    });
  }
}    

function favicon(response, request, collection, url)
{
  //Read and display the favicon
  fs.readFile('./favicon.ico', function (err, ico) 
  {
      response.writeHead(200, {"Content-Type": "text/html"});       
      response.write(ico);
      response.end();
  });
}

function start(response) {
  console.log("\nRequest handler 'start' was called.");

  var body = "<html lang = 'en' style= 'background-color:#00FFFF; padding: 20px 50px 50px ALIGN:center' >" +
    '<head>'+
    "<!-- Title Bar Start -->" +
        "<h3 style='padding-bottom:20px' ALIGN = center><i>GZ Database</i> </h3>" +
        "<table border ='1' ALIGN = 'center' >" +
            "</tr><tr>" +
                "<td style ='padding: 5px 10px'><a href = '/start'>Start<a></td>" +
                "<td style ='padding: 5px 10px'><a href = '/Inventory'>Inventory Manager</a></td>" +
            "</tr>" +
        "</table>" +
        "<!-- Title Bar End -->" +
    '<h1>Upload an image file</h1>' +
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload" multiple="multiple">'+
    '<input type="submit" value="Upload file" />'+
    '</form>'+
    '<p>Or go to the <a href ="./Inventory"/> Inventory Form </a></p>' +
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {
  console.log("\nRequest handler 'upload' was called.");

  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function(error, fields, files) {
  console.log("parsing done");

    /* Possible error on Windows systems:
       tried to rename to an already existing file */
    fs.rename(files.upload.path, "/tmp/test.png", function(err) {
      if (err) {
        fs.unlink("/tmp/test.png");
        fs.rename(files.upload.path, "/tmp/test.png");
      }
    });
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received image:<br/>");
    response.write("<img src='/show' />");
    response.end();
  });
}

function show(response) {
  console.log("\nRequest handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

// var UnitClassArray;
function SpecManager(response, request, collection, url) {

  console.log("\nRequest handler 'SpecManager' was called");
  var FieldQuery = url.parse(request.url,true).query;

  if(!FieldQuery.hasOwnProperty('Event'))
  {
    fs.readFile('./SpecManager.html', function (err, html) 
    {
      if(err)
      {
         response.writeHead(404, {"Content-Type": "text/plain"});
         response.write(error + "\n");
         response.end();
      }
      else 
      {
        response.writeHead(200, {"Content-Type": "text/html"});       
        response.write(html);
        response.end();
        console.log('loading SpecManager Form');
      }
    });
  }

  if(FieldQuery.Event=='InsertUnitClass')
  {
    collection.save({'lib_id': 'SpecLib', 'UnitClass_id': FieldQuery.UnitClass_id});
    collection.ensureIndex({'UnitClass_id':1},{unique: true, sparse: true, dropDups: true});
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(FieldQuery.UnitClass_id + ' successfully added');
    response.end();
  }

  if(FieldQuery.Event=='RemoveUnitClass')
  {
    collection.findAndRemove({'lib_id':'SpecLib','UnitClass_id': FieldQuery.UnitClass_id},
      function(error, result)
    {
      if(result!=null)
      {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(FieldQuery.UnitClass_id+' successfully removed');
        response.end();
      }
      else
      {
        console.log('!--Remove failed--!');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write('Failure to Remove \' '+ FieldQuery.UnitClass_id + ' \' : Unit not found.');
        response.end();
      }
    });
  }

  if(FieldQuery.Event=='LoadUnitClassOptions')
  {
    collection.find({'lib_id':'SpecLib'}).toArray(
      function (error, UnitClasses)
      {
        if(UnitClasses.length)
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('<table width = "400px" border = "1" ALIGN = center>' +
                            '<tr>' +
                            '<td style = "background-color:#E0E0E0; width: 90px; text-align:center"> <b>Unit Classes</b>' +
                            '</td>' +
                            '</tr>');
          for(i=0;i<UnitClasses.length;i++)
          {
            response.write('<tr>' +
              '<td style = "background-color:#F0F0F0; width:90px; vertical-align:top;">' +
              UnitClasses[i].UnitClass_id +
              '</td>' +
              '</tr>'
              );

            console.log("Query results: " + UnitClasses[i].UnitClass_id + "   #" + i);
          }
          response.write('</table>');
          response.end();
          // UnitClassArray = UnitClasses;
        }
        else
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('<table width = "400px" border = "1" ALIGN = center>' +
          '<tr>' +
          '<td style = "background-color:#E0E0E0; width: 90px; text-align: center">' +
          '<b>---  Unit List Empty ---</b>' +
          '</td>' +
          '</tr>' +
          '</table>');
          response.end();
        }
      });
  }
}

/*
* This is the handler for the parameter page.  This page is used to
* manage the lowest level of a products specs.  The user can add and
* remove fields. There is also a live list view of the available fields.
*/
function parameter (response, request, collection, url, content) {

  //parse url
  console.log("\nRequest handler 'parameter'");
  var FieldQuery = url.parse(request.url,true).query;

  // Return the main page if the page hasn't loaded yet.
  if(!FieldQuery.loaded)
  {
    requestHelpers.return_html('./parameter.html', response);
  }
 
  //If there was an insertion requested, add the entry to the db, initialize its value to null.
  if(FieldQuery.action == 'newField')
  {
    //Save the new field to the db only if it's a unique name, don't allow duplicates
    collection.save({'type': 'field', 'field_name': FieldQuery.field_name, 'field_value':'null'});
    collection.ensureIndex({'field_name':1},{unique: true, sparse: true, dropDups: true});
    //Send the response back to the page
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write('New Field — \'' + FieldQuery.field_name + '\' successfully added');
    response.end();
  }

  //If there is a removal requested, remove the field from the db if it exists
  if(FieldQuery.action == 'removeField')
  {
    collection.findAndRemove({'type': 'field', 'field_name': FieldQuery.field_name, 'field_value': 'null'},
    function(error, result)
    {
      //If it's found and removed successfully, report it.
      if(result!=null)
      {
        console.log('Field Removal: successful');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(FieldQuery.field_name + ' successfully removed');
        response.end();
      }
      //otherwise, report that the field wasn't found
      else
      {
        console.log('Field Removal: nothing to remove');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write('Failure to Remove \' '+ FieldQuery.field_name + ' \' : Field not found.');
        response.end();
      }
    });
  }

  //This is called on every change to the db and on page load
  //This is the full list of available fields
  if(FieldQuery.action == 'getFields')
  {
    //Get the list of fields from the db
    collection.find({'type':'field'}).toArray(
      function(error, result)
      {
        //If there's something returned from the db, send it to the page as
        //a JSON object
        if(result!=null)
        {
          var string = JSON.stringify(result);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(string);
          response.end();
        }
        //Otherwise, let the page know, it's empty
        else
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('--empty--');
          response.end();
        }
        //If there's an error, log it.
        if(error)
        {
          console.log("\nError in 'getFields':" + error + '\n');
        }
      });
  }
}

function group(response, request, collection, url)
{
  console.log("\nRequest handler 'group'");
  var FieldQuery = url.parse(request.url,true).query;

  // Return the main page if the page hasn't loaded yet.
  if(!FieldQuery.loaded)
  {
    requestHelpers.return_html('./group.html', response);
  }
  //This is called on every change to the db and on page load
  //This is the full list of available fields
  if(FieldQuery.action == 'getFields')
  {
    //Get the list of fields from the db
    collection.find({'type':'field'}).toArray(
      function(error, result)
      {
        //If there's something returned from the db, send it to the page as
        //a JSON object
        if(result!=null)
        {
          var string = JSON.stringify(result);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(string);
          response.end();
        }
        //Otherwise, let the page know, it's empty
        else
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('--empty--');
          response.end();
        }
        //If there's an error, log it.
        if(error)
        {
          console.log("\nError in 'getFields':" + error + '\n');
        }
      });
  }

  if(FieldQuery.action == 'getFieldsOfSelectedGroup')
  {
    collection.find({'group_name': FieldQuery.group_name}).toArray( 
      function(error, result)
      {
        if(result!=null)
        {
          console.log(result[0].fields[0]);
          var fieldsAsString = JSON.stringify(result[0].fields);
          console.log(fieldsAsString);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(fieldsAsString);
          response.end();
        }
        else
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('--empty--');
          response.end();
        }
        //If there's an error, log it.
        if(error)
        {
          console.log("\nError in 'getGroups':" + error + '\n');
        }
      });
  }

  if(FieldQuery.action == 'getGroups')
  {
    //Get the list of fields from the db
    collection.find({'type':'group'}).toArray(
      function(error, result)
      {
        //If there's something returned from the db, send it to the page as
        //a JSON object
        if(result!=null)
        {
          var string = JSON.stringify(result);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(string);
          response.end();
        }
        //Otherwise, let the page know, it's empty
        else
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('--empty--');
          response.end();
        }
        //If there's an error, log it.
        if(error)
        {
          console.log("\nError in 'getGroups':" + error + '\n');
        }
      });
  }

  if(FieldQuery.action == 'newGroup')
  {
    var group_fields = FieldQuery.group_fields;

    collection.find({'type': 'group', 'group_name': FieldQuery.group_name}).toArray( 
      function(error, result)
      {
        if(error)
        {
          console.log('Error: ' + error);
        }
        else
        {
          if(result.length == 1)
          {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write('A Group with name — \'' + FieldQuery.group_name + '\' already exists');
            response.end();
          }
          else if(result.length == 0)
          {
            collection.save({'type': 'group', 'group_name': FieldQuery.group_name, 'fields' : group_fields});
            collection.ensureIndex({'group_name':1},{unique: true, sparse: true, dropDups: true});
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write('New Group — \'' + FieldQuery.group_name + '\' successfully added');
            response.end();
          }
        }
      });
  }

  if(FieldQuery.action == 'removeGroup')
  {
    collection.findAndRemove({'group_name' : FieldQuery.group_name},
      function(error, result)
    {
      if(result!=null)
      {
        console.log('Removal of Group: ' + FieldQuery.group_name + 'Succeeded');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write('Group \'' + FieldQuery.group_name + '\' successfully removed');
        response.end();
      }
      else
      {
        console.log('Removal of Group: ' + FieldQuery.group_name + 'Failed');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write('Failure to Remove Group\' '+ FieldQuery.group_name + ' \' : Group not found.');
        response.end();
      }
    });
  }
}

//Handler for product builder page
function productBuilder(response, request, collection, url)
{
  console.log("\nRequest handler 'Product Builder'");
  var FieldQuery = url.parse(request.url,true).query;

  // Return the main page if the page hasn't loaded yet.
  if(!FieldQuery.loaded)
  {
    requestHelpers.return_html('./productBuilder.html', response);
  }

  if(FieldQuery.action == 'getFieldsOfSelectedGroup')
  {
    collection.find({'group_name': FieldQuery.group_name}).toArray( 
      function(error, result)
      {
        if(result!=null)
        {
          var objString = JSON.stringify(result);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(objString);
          response.end();
        }
        else
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('--empty--');
          response.end();
        }
        //If there's an error, log it.
        if(error)
        {
          console.log("\nError in 'getFieldsOfSelectedGroup':" + error + '\n');
        }
      });
  }

  if(FieldQuery.action == 'newProduct')
  {
    var group_field_sets = new Array();
    var selected = eval('(' + FieldQuery.selected + ')'); //parse the passed JSON string as a JSON object

    collection.find({'type': 'product', 'product_name': FieldQuery.product_name}).toArray( 
      function(error, result)
      {
        if(error)
        {
          console.log('Error: ' + error);
        }
        else
        {
          if(result.length == 1)
          {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write('A Product with name — \'' + FieldQuery.product_name + '\' already exists');
            response.end();
          }
          else if(result.length == 0)
          {
            var i;
            for(i=0;i<selected.length;i++)
            {
              selected[i].value = 0;
            }

            collection.save({'type': 'product', 'product_name': FieldQuery.product_name, 'specs' : selected});
            collection.ensureIndex({'product_name':1},{unique: true, sparse: true, dropDups: true});
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write('New Product — \'' + FieldQuery.product_name + '\' successfully added');
            response.end();

          }
        }
      });
  }

  if(FieldQuery.action == 'getProducts')
  {
    //Get the list of fields from the db
    collection.find({'type':'product'}).toArray(
      function(error, result)
      {
        //If there's something returned from the db, send it to the page as
        //a JSON object
        if(result!=null)
        {
          var string = JSON.stringify(result);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(string);
          response.end();
        }
        //Otherwise, let the page know, it's empty
        else
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('--empty--');
          response.end();
        }
        //If there's an error, log it.
        if(error)
        {
          console.log("\nError in 'getProducts':" + error + '\n');
        }
      });
  }

  if(FieldQuery.action == 'getSpecs')
  {
    collection.find({'product_name': FieldQuery.product_name}).toArray(
      function(error, product)
      {
        if(error)
        {
          console.log('Error: ' + error);
        }
        else if(!product)
        {
          console.log('--Here!-- # 1: ');
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('--empty--');
          response.end();
        }
        else
        {
          var string = JSON.stringify(product);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(string);
          response.end();
        }
      });
  }

  if(FieldQuery.action == 'updateSpecs')
  {
    var specs = eval('(' + FieldQuery.specs + ')'); //parse the passed JSON string as a JSON object
    // var specs = FieldQuery.specs;
    for(var i = 0;i<specs.length;i++)
    {
      console.log('Handler Specs: ' + specs[i].value);
    }

    collection.find({'type': 'product', 'product_name': FieldQuery.product_name}).toArray( 
      function(error, result)
      {
        if(error)
        {
          console.log('Error: ' + error);
        }
        else
        {
          if(result.length == 1)
          {
            console.log('specs added to db as: ' + JSON.stringify(specs));
            collection.update({'product_name': FieldQuery.product_name},
              {'type':'product', 'product_name':FieldQuery.product_name, 'specs' : specs});
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write('Product — \'' + FieldQuery.product_name + '\' successfully updated');
            response.end();
          }
          else if(result.length == 0)
          {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write('A Product with name — \'' + FieldQuery.product_name + '\' Not Found');
            response.end();
          }
        }
      });
  }

}

function Inventory(response, request, collection, url) {

  console.log("\nRequest handler 'Inventory' was called");
  var FieldQuery = url.parse(request.url,true).query;

  if(!FieldQuery.hasOwnProperty('Event'))
  {
    fs.readFile('./Inventory.html', function (err, html) 
    {
      if(err)
      {
         response.writeHead(404, {"Content-Type": "text/plain"});
         response.write(error + "\n");
         response.end();
      }
      else 
      {
        response.writeHead(200, {"Content-Type": "text/html"});       
        response.write(html);
        response.end();
        console.log('loading Inventory Form');
      }
    });
  }

  if(FieldQuery.Event=='Insert')
  {
    collection.save({'lib_id': 'InventoryLib', 'sku': FieldQuery.sku, 'desc': FieldQuery.desc});
    collection.ensureIndex({'sku':1},{unique: true, sparse: true, dropDups: true});
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(FieldQuery.sku +' - ' + FieldQuery.desc + ' successfully added');
    response.end();
  }

  if(FieldQuery.Event=='Remove')
  {
    collection.findAndRemove({'lib_id':'InventoryLib','sku': FieldQuery.sku, 'desc': FieldQuery.desc},
      function(error, result)
    {
      if(result!=null)
      {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(FieldQuery.sku + ' - ' + FieldQuery.desc +' successfully removed');
        response.end();
      }
      else
      {
        console.log('!--Remove failed--!');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write('Failure to Remove \' '+ FieldQuery.sku + ' - ' + FieldQuery.desc + ' \' : Unit not found.');
        response.end();
      }
    });
  }

  if(FieldQuery.Event=='List')
  {
    collection.find({'lib_id': 'InventoryLib'}).toArray(
      function (error, doc)
      {
        if(doc.length)
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('<table width = "400px" border = "1" ALIGN = center>' +
                            '<tr>' +
                            '<td style = "background-color:#E0E0E0; width: 90px; text-align:center"> <b>SKUs</b>' +
                            '</td>' +
                            '<td style = "background-color:#E0E0E0; text-align:center"> <b>Product Description</b>' +
                            '</td>' +
                            '</tr>');
          for(i=0;i<doc.length;i++)
          {
            response.write('<tr>' +
              '<td style = "background-color:#F0F0F0; width:90px; vertical-align:top;">' +
              doc[i].sku +
              '</td>' +
              '<td style = "background-color:#F0F0F0; vertical-align:top;">' +
              doc[i].desc +
              '</td>' + 
              '</tr>'
              );

            console.log("Query results: " + doc[i].sku + " : " + doc[i].desc + "   #" + i);
          }
          response.write('</table>');
          response.end();
        }
        else
        {
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write('<table width = "400px" border = "1" ALIGN = center>' +
          '<tr>' +
          '<td style = "background-color:#E0E0E0; width: 90px; text-align: center">' +
          '<b>---  Inventory Empty ---</b>' +
          '</td>' +
          '</tr>' +
          '</table>');
          response.end();
        }
      });
  }

}

// exports.UnitClassArray = UnitClassArray; 
exports.favicon = favicon;
exports.productBuilder = productBuilder;
exports.group = group;
exports.parameter = parameter;
exports.start = start;
exports.upload = upload;
exports.show = show;
exports.Inventory = Inventory;
exports.Home = Home;
exports.SpecManager = SpecManager;

//Imports
var multipart = require("multipart-js");
var sys = require("util");
var fs = require("fs");
var path = require("path");
var express = require("express");


//Creating the server
var server = express.createServer();
server.get('/', display_form);
server.post('/upload', upload_file)
server.get('/json/:filename', render_as_json);
server.register('.html', require('jade'));
server.use(express.static(__dirname));
server.get('/choose/:filename', function(req, res) {
    fs.readFile(__dirname + '/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});
server.get('/fileapi', function(req, res) {
    fs.readFile(__dirname + '/file-api.html', 'utf8', function(err, text){
        res.send(text);
    });
});
server.listen(8000);
/*
 * Display upload form
 */
function display_form(req, res) {
    res.setHeader("200", {"Content-Type": "text/html"});
    res.write(
        '<html><head><title>Upload file</title></head><body>' + 
        '<form action="/upload" method="post" enctype="multipart/form-data">' +
        '<input type="file" name="upload-file">' +
        '<input type="submit" value="Upload">' +
        '</form>'+
        '</body></html>'
    );
    res.end();
}

/*
 * Create multipart parser to parse given request
 */
function parse_multipart(req) {
    var parser = multipart.parser();

    // Make parser use parsed request headers
    parser.headers = req.headers;

    // Add listeners to request, transfering data to parser

    req.addListener("data", function(chunk) {
        parser.write(chunk);
    });

    req.addListener("end", function() {
        parser.close();
    });

    return parser;
}

/*
 * Handle file upload
 */
function upload_file(req, res) {
    // Request body is binary
    req.setEncoding("binary");

    // Handle request as multipart
    var stream = parse_multipart(req);

    var fileName = null;
    var fileStream = null;

    // Set handler for a request part received
    stream.onPartBegin = function(part) {
        sys.debug("Started part, name = " + part.name + ", filename = " + part.filename);

        // Construct file name
        fileName = "./uploads/" + stream.part.filename;

        // Construct stream used to write to file
        fileStream = fs.createWriteStream(fileName);

        // Add error handler
        fileStream.addListener("error", function(err) {
            sys.debug("Got error while writing to file '" + fileName + "': ", err);
        });

        // Add drain (all queued data written) handler to resume receiving request data
        fileStream.addListener("drain", function() {
            req.resume();
        });
    };

    // Set handler for a request part body chunk received
    stream.onData = function(chunk) {
        // Pause receiving request data (until current chunk is written)
        req.pause();

        // Write chunk to file
        // Note that it is important to write in binary mode
        // Otherwise UTF-8 characters are interpreted
        sys.debug("Writing chunk");
        fileStream.write(chunk, "binary");
    };

    // Set handler for request completed
    stream.onEnd = function() {
        // As this is after request completed, all writes should have been queued by now
        // So following callback will be executed after all the data is written out
        fileStream.addListener("drain", function() {
            // Close file stream
            fileStream.end();
            // Handle request completion, as all chunks were already written
            upload_complete(res, fileName.substring(10,fileName.length));
        });
    };
}

function upload_complete(res, filename) {
    sys.debug("Request complete");

    // Render response
    res.setHeader("200", {"Content-Type": "text/html"});
    res.write('<html><body>')
    res.write("Thanks for uploading, you file will be taken care of!<br/>");
    res.write('Check out your categories <a href=index.html#'+filename+'>here.</a>')
    res.end();

    sys.puts("\n=> Done");
}


function render_as_json(req, res) {
    res.setHeader("200", {"Content-Type": "text/plain"});
    var filename = req.params.filename;
    sys.debug("Displaying categories for filename" + filename)
    getHeadingsFromCsvFile('./uploads/' + filename, function(d){
        res.write('{ "Categories": ');
         res.write(JSON.stringify(d[0]));
         res.write(',\r\n"Data": ')
         res.write(JSON.stringify(d.slice(1,d.length)));
         res.end("}");})
}

function getHeadingsFromCsvFile(fileName, callback){
  sys.debug("hitting GetHeadingsFromCsvFIle with filename: "+fileName)
  fs.readFile(fileName, function(err,data) {
    if(err) throw err;
    var file = CSVToArray(data.toString(),";");
    sys.debug("File is now: \r\n"+file.toString().substring(0,40) +"... and callback is : "+callback.toString())
    callback(file)
})
}
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    sys.debug("Hitting CSVToArray with Data: "+strData.substring(0,200)+"...")
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
            (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                    strMatchedDelimiter.length &&
                    (strMatchedDelimiter != strDelimiter)
                    ){

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push( [] );

            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var strMatchedValue = arrMatches[ 2 ].replace(
                            new RegExp( "\"\"", "g" ),
                            "\""
                            );

            } else {

                    // We found a non-quoted value.
                    var strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}

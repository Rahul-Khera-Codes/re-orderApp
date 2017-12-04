let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let http = require('http');
let fs = require('fs');
let _ = require('lodash');
let app = express();
let structure = require('./structure');

app.server = http.createServer(app);

app.use(cors({
    exposedHeaders: ["Link"]
}));
app.use(bodyParser.json({
    limit: "1000kb"
}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/fetch/data", (req, res, next) => {
    let data = []
    let dirname = __dirname + "/CustomerProductControl";
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            console.log(err)
        }
        filenames.forEach(function(filename) {
            fs.readFile(dirname + "/" + filename, 'utf-8', function(err, content) {
                if (err) {
                    console.log(err)
                }
                let content_data = content.toString();
                let data_array = content_data.split("[#]");
                let final_data = []
                _.forEach(data_array, function(val, key) {
                    final_data.push(val.split("|#"))
                })
                let data_object = {
                    name: filename.replace(/(.*)\.(.*?)$/, "$1"),
                    data: final_data
                }
                data.push(data_object)
                if (data.length == filenames.length) {
                    createStructure(data, function(response) {
                        res.json({ data: response })
                    })
                }
            });
        });
    });

    function createStructure(data, callback) {
        let array_data = []
        _.forEach(structure, (val, key) => {
            let filtered = _.filter(data, (filtered_data) => { return filtered_data.name == val.filename })
            let i = 0
            let table_data = []
            _.forEach(filtered[0].data, (filtered_data, filtered_key) => {
                let j = 0;
                let a = {};
                _.forEach(val.structure, (data_value, key_value) => {
                    a[key_value] = filtered_data[j++];
                })
                table_data.push(a);
                if (filtered_key == filtered[0].data.length - 1) {
                    array_data.push({
                        type: val.type,
                        name: val.name,
                        database: val.database,
                        data: table_data
                    })
                    table_data = []
                }
            })
            if (key == structure.length - 1) {
                callback(array_data)
            }
        })
    }
})

app.listen(process.env.PORT || 8000)

console.log("Started on port " + 8000);
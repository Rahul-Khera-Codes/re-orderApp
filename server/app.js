let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let http = require('http');
let fs = require('fs');
let _ = require('lodash');
let app = express();
let structure = require('./structure');
let mailer = require('nodemailer')

app.server = http.createServer(app);

app.use(cors({
  exposedHeaders: ["Link"]
}));
app.use(bodyParser.json({
  limit: "5mb"
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
          a[key_value] = (filtered_data[j++] != undefined ? filtered_data[j - 1].replace(/\"/g, "") : (data_value == "BOOLEAN" ? false : ""));
        })
        table_data.push(a);
        if (filtered_key == filtered[0].data.length - 1) {
          table_data.pop()
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


app.post('/save/data', function(req, res, next) {
  let orignal_data = req.body;
  let fileData = "";
  let filtered = _.filter(structure, (filtered_data) => {
    return filtered_data.name == orignal_data.name
  })
  let file_path = filtered.length ? `CustomerProductControl/${filtered[0].filename}.txt` : `CustomerProductControl/${orignal_data.name}.txt`

  function createDataString(data, callback) {
    let records = data.splice(0, 1)[0]
    if (fileData != "") {
      fileData += '[#]';
    }
    if (!filtered.length) {
      console.log(records)
      if (records.IsExported == undefined)
        delete records.IsExported
    }
    Object.keys(records).forEach(function(value, key) {
      if (key == records.length - 1) {
        fileData += records[value]
      } else {
        fileData += records[value] + "|#"
      }
    })
    if (data.length) {
      createDataString(data, callback)
    } else {
      callback(fileData)
    }
  }
  if(orignal_data['data'].length){
    createDataString(orignal_data['data'], function(response) {

    fs.writeFile(file_path, response + "[#]", function(err) {
      if (err) {
        console.log(err);
      } else {
        res.json("file is saved")
      }
    });
  })
  }else{
    res.json({message: "no data for imported"})
  }
})

app.put('/forget/password', function(req, res, next) {
  const transporter = mailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'xinqs4wqf7sywvrw@ethereal.email',
      pass: 'j7nW9fDXaDpqaBWkGY'
    }
  });

  let mailOptions = {
    from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
    to: req.body.email, // list of receivers
    subject: req.body.subject, // Subject line
    text: '', // plain text body
    html: req.body.html // html body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    res.json({ response: info, messageView: mailer.getTestMessageUrl(info) });
  });
})

app.get('/track/:email', function(req, res, next) {
  console.log(req.params.email)
})

app.listen(process.env.PORT || 3031)

console.log("Started on port " + 3031);

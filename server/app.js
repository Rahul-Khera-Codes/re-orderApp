let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let http = require('http');
let fs = require('fs');
let _ = require('lodash');
let app = express();
let structure = require('./structure');
let mailer = require('nodemailer');

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

// fetch all data...


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

function fetchAllData(callback) {
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
            callback({ data: response })
          })
        }
      });
    });
  });
}


app.get("/fetch/data", (req, res, next) => {
  fetchAllData(function(response) {
    res.json(response)
  })
})

// login details....

app.get('/get/loginDetails', function(req, res, next) {
  fetchAllData(function(response) {
    res.json({ data: response.data.slice(0, 2) })
  })
})


// login user data

app.post('/get/userData', function(req, res, next) {
  let { tableName, IDWeb, IDLocal, barCode } = req.body;
  let product_cancignment = []
  let product_table_data = []
  let product_list_contact = []
  fetchAllData(function(response) {
    let data = response.data;
    let List_to_Contact = data.find(function(data_response) {
      return data_response.name == 'List_to_Contact';
    })
    let Product_Control_List = data.find(function(data_response) {
      return data_response.name == 'Product_Control_List';
    })
    let Product_Control_Line = data.find(function(data_response) {
      return data_response.name == 'Product_Control_Line';
    })
    let Product = data.find(function(data_response) {
      return data_response.name == 'Product';
    })


    if (tableName == 'Customer_Table') {
      findInProductList(function(product_List) {
        let list_data_product = JSON.stringify(product_List);
        findProductLine(JSON.parse(list_data_product), function(productLine) {
          let consignment_data = JSON.stringify(productLine);
          findProduct(JSON.parse(consignment_data), function(product) {
            let final_response = []
            final_response.push(product_List);
            final_response.push(productLine)
            final_response.push(product)
            res.json({ data: final_response })
          })
        })
      })
    } else if (tableName == 'Contact_Table') {
      findFromContactToTable(function(contact_response) {
        let contact_response_data = JSON.stringify(contact_response)
        findProductListForContact(JSON.parse(contact_response_data), function(product_list) {
          let list_data_product = JSON.stringify(product_list);
          findProductLine(JSON.parse(list_data_product), function(productLine) {
            let consignment_data = JSON.stringify(productLine);
            findProduct(JSON.parse(consignment_data), function(product) {
              let final_response = []
              final_response.push(contact_response)
              final_response.push(product_list);
              final_response.push(productLine)
              final_response.push(product)
              res.json({ data: final_response })
            })
          })
        })
      })
    }

    function findProductListForContact(contact_response_data, callback) {
      let contact_data = contact_response_data.data.splice(0, 1)[0];
      if (contact_data.ListIDWeb * 1 != -1) {
        let list = _.filter(Product_Control_List.data, (filtered_data) => { return filtered_data.IDWeb == contact_data.ListIDWeb });
        _.forEach(list, (val, key) => {
          if (product_list_contact.indexOf(val) < 0) {
            product_list_contact.push(val)
          }
          if (key == list.length - 1) {
            if (contact_response_data.data.length) {
              findProductListForContact(contact_response_data, callback)
            } else {
              callback({ type: Product_Control_List.type, database: Product_Control_List.database, name: Product_Control_List.name, data: product_list_contact })
            }
          }
        })
      } else {
        let list = _.filter(Product_Control_List.data, (filtered_data) => { return parseInt(filtered_data.IDLocal) == contact_data.ListIDLocal });
        _.forEach(list, (val, key) => {
          if (product_list_contact.indexOf(val) < 0) {
            product_list_contact.push(val)
          }
          if (key == list.length - 1) {
            if (contact_response_data.data.length) {
              findProductListForContact(contact_response_data, callback)
            } else {
              callback({ type: Product_Control_List.type, database: Product_Control_List.database, name: Product_Control_List.name, data: product_list_contact })
            }
          }
        })
      }
    }

    function findFromContactToTable(callback) {
      if (IDWeb * 1 != -1 && !barCode) {
        callback({ type: List_to_Contact.type, database: List_to_Contact.database, name: List_to_Contact.name, data: _.filter(List_to_Contact.data, (filtered_data) => { return filtered_data.ContactIDWeb == IDWeb }) })
      } else if (IDLocal * 1 != -1 && !barCode) {
        callback({ type: List_to_Contact.type, database: List_to_Contact.database, name: List_to_Contact.name, data: _.filter(List_to_Contact.data, (filtered_data) => { return filtered_data.ContactIDLocal == IDLocal }) })
      } else {
        callback({ type: List_to_Contact.type, database: List_to_Contact.database, name: List_to_Contact.name, data: _.filter(List_to_Contact.data, (filtered_data) => { return (filtered_data.ContactIDLocal == IDLocal && IsDefault == true) }) })
      }
    }

    function findInProductList(callback) {
      if (IDWeb * 1 != -1 && !barCode) {
        callback({ type: Product_Control_List.type, database: Product_Control_List.database, name: Product_Control_List.name, data: _.filter(Product_Control_List.data, (filtered_data) => { return filtered_data.CustomerIDWeb == IDWeb }) })
      } else if (IDLocal * 1 != -1 && !barCode) {
        callback({ type: Product_Control_List.type, database: Product_Control_List.database, name: Product_Control_List.name, data: _.filter(Product_Control_List.data, (filtered_data) => { return filtered_data.CustomerIDLocal == IDLocal }) })
      } else {
        callback({ type: Product_Control_List.type, database: Product_Control_List.database, name: Product_Control_List.name, data: _.filter(Product_Control_List.data, (filtered_data) => { return (filtered_data.CustomerIDLocal == IDLocal && filtered_data.IsDefault == true) }) })
      }
    }

    function findProductLine(productList, callback) {
      let product_list = productList['data'].splice(0, 1)[0]
      if (product_list.IDWeb * 1 != -1) {
        let list = _.filter(Product_Control_Line.data, (filtered_data) => { return filtered_data.ListIDWeb == product_list.IDWeb });
        _.forEach(list, (val, key) => {
          if (product_cancignment.indexOf(val) < 0) {
            product_cancignment.push(val)
          }
          if (key == list.length - 1) {
            if (productList.data.length) {
              findProductLine(productList, callback)
            } else {
              callback({ type: Product_Control_Line.type, database: Product_Control_Line.database, name: Product_Control_Line.name, data: product_cancignment })
            }
          }
        })
      } else {
        let list = _.filter(Product_Control_Line.data, (filtered_data) => { return filtered_data.ListIDLocal == parseInt(product_list.IDLocal) });
        _.forEach(list, (val, key) => {
          if (product_cancignment.indexOf(val) < 0) {
            product_cancignment.push(val)
          }
          if (key == list.length - 1) {
            if (productList.data.length) {
              findProductLine(productList, callback)
            } else {
              callback({ type: Product_Control_Line.type, database: Product_Control_Line.database, name: Product_Control_Line.name, data: product_cancignment })
            }
          }
        })
      }
    }

    function findProduct(product_details, callback) {
      let product_info = product_details.data.splice(0, 1)[0]
      let list = _.filter(Product.data, (filtered_data) => { return filtered_data.ID == product_info.ProductIDLocal });
      _.forEach(list, (val, key) => {
        if (product_table_data.indexOf(val) < 0) {
          product_table_data.push(val)
        }
        if (key == list.length - 1) {
          if (product_details.data.length) {
            findProduct(product_details, callback)
          } else {
            callback({ type: Product.type, database: Product.database, name: Product.name, data: product_table_data })
          }
        }
      })
    }
  })
})

//imort data...

app.post('/save/data', function(req, res, next) {
  let orignal_data = req.body;
  let fileData = "";
  let filtered = _.filter(structure, (filtered_data) => {
    return filtered_data.name == orignal_data.name
  })
  let file_path = filtered.length ? `CustomerProductControl/${filtered[0].filename}.txt` : `CustomerProductControl/${orignal_data.name + new Date()}.txt`

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
  if (orignal_data['data'].length) {
    createDataString(orignal_data['data'], function(response) {

      fs.writeFile(file_path, response + "[#]", function(err) {
        if (err) {
          console.log(err);
        } else {
          res.json({ message: "file is saved" })
        }
      });
    })
  } else {
    res.json({ message: "no data for imported" })
  }
})

app.put('/forget/password', function(req, res, next) {
  const transporter = mailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: 'testhr69@gmail.com',
      pass: 'java@123'
    }
  });

  let mailOptions = {
    from: 'testhr69@gmail.com', // sender address
    to: req.body.email, // list of receivers
    subject: req.body.subject, // Subject line
    text: '', // plain text body
    html: req.body.html // html body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    res.json({ response: info });
  });
})

app.get('/track/:email', function(req, res, next) {
  console.log(req.params.email)
})

app.listen(process.env.PORT || 3031)

console.log("Started on port " + 3031);

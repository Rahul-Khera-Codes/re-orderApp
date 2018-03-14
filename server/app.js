let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let http = require('http');
let fs = require('fs');
let _ = require('lodash');
let app = express();
let structure = require('./structure');
let mailer = require('nodemailer');
let request = require('request');
var mysql = require('mysql');
var moment = require('moment');

var con = mysql.createConnection({
  host: "localhost",
  user: "bstgroup_cpc0",
  password: "{m*A&YpO,*Ro",
  database: "bstgroup_custprodcont0"
});
let file_location;

let list_of_file_to_import = [
  'ppp_Customer_ProductControlProductControl.txt',
  'ppp_Customer_ProductControlContact.txt',
  'ppp_Customer_ProductControlCustomer.txt',
  'ppp_Customer_ProductControlProductControlLine.txt',
  'ppp_Customer_ProductControlProductControlToContact.txt',
  'ppp_Customer_ProductControlProduct.txt',
  'ppp_Customer_ProductControlProductCodes.txt'
]

let export_file_location;

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("create table IF NOT EXISTS configuration (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), value VARCHAR(1000))", function(err, result) {
    if (err) throw err;
    con.query("select * from configuration where ID=1", (err, import_file_location) => {
      if (err) throw err;
      file_location = import_file_location[0].Value;
      con.query("select * from configuration where ID=2", (err, export_file_path) => {
        if (err) throw err;
        export_file_location = export_file_path[0].Value;
      })
    })
  });
});

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

let table_name = []

function tables(file_location) {
  return new Promise((resolve, reject) => {
    fs.readdir(file_location, (err, files) => {
      files.forEach((file, count) => {
        table_name.push({ filename: file, table: file.replace(/\..+$/, '').replace('ppp_Customer_ProductControl', '').toLowerCase() })
        if (count == files.length - 1) {
          resolve(table_name)
        }
      });
    })
  });
}

function insertDataInTime(table_info, callback) {
  let table = table_info.splice(0, 1)[0]
  con.query(`TRUNCATE TABLE ${table.table}`, function(err, truncate_response) {
    if (err) throw err;
    let terminated_by = "|#"
    con.query(`load data infile '${file_location}/${table.filename}' into table ${table.table} fields terminated by '|#' LINES TERMINATED BY '[#]'`, function(err, insert_reponse) {
      if (err) throw err;
      if (table_info.length) {
        insertDataInTime(table_info, callback)
      } else {
        callback("DataInserted")
      }
    })
  })
}

app.get('/import/dataToWebServer', (req, res, next) => {
  tables(file_location).then((table) => {
    let list_of_files = _.filter(table, (filtered_data) => { return list_of_file_to_import.indexOf(filtered_data.filename) >= 0 })
    insertDataInTime(list_of_files, function(insertData) {
      table_name = []
      res.json({ status: 1, message: insertData })
    })

  })
})

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
        a[key_value] = (filtered_data[j++] != undefined ? filtered_data[j - 1].replace(/\"/g, "").trim() : (data_value == "BOOLEAN" ? false : ""));
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
  // let dirname = "../../../tmp/data_files_dev0/feeds";
  // let dirname = __dirname + "/CustomerProductControl"
  let dirname = file_location
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      console.log(err)
    }
    filenames = _.filter(filenames, (filtered_data) => { return list_of_file_to_import.indexOf(filtered_data) >= 0 })
    filenames.forEach(function(filename) {
      console.log(dirname + "/" + filename)
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

function getUserData(body, callback) {
  let { tableName, IDWeb, IDLocal, barCode } = body;
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
            callback({ data: final_response })
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
              callback({ data: final_response })
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

}

//imort data...


app.post('/save/data', function(req, res, next) {
  let orignal_data = req.body;
  let fileData = "";
  let filtered = _.filter(structure, (filtered_data) => {
    return filtered_data.name == orignal_data.name
  })
  console.log(req.body)
  // let file_path = filtered.length ? `../../../tmp/data_files/feeds/CustomerProductControl/${filtered[0].filename}.txt` : `../../../tmp/data_files/feeds/CustomerProductControl/${orignal_data.name + new Date()}.txt`
  let file_path = filtered.length ? `${export_file_location}/${filtered[0].filename}.txt` : `${export_file_location}/${orignal_data.name}_${orignal_data.ListIdLocal}_${moment(new Date()).format('YYYY-MM-DD-hh-mm-ss')}.txt`
  console.log(file_path)

  function createDataString(data, callback) {
    let records = data.splice(0, 1)[0]
    if (fileData != "") {
      fileData += '[#]';
    }
    if (!filtered.length) {
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
        let usageAndUsageLine = [{
          tableName: orignal_data.name == 'Usage' ? 'productcontrolusage' : 'productcontrolusageline',
          filename: `${orignal_data.name}_${orignal_data.ListIdLocal}_${moment(new Date()).format('YYYY-MM-DD-hh-mm-ss')}.txt`
        }]

        importUsageAndUsageLine(usageAndUsageLine, function(data) {
          request('http://localhost:3031/import/dataToWebServer', function(error, response, body) {
            if (err) {
              console.log(err);
            } else {
              res.json({ message: "file is saved" })
            }
          })
        })
      });
    })
  } else {
    res.json({ message: "no data for imported" })
  }
})


let importUsageAndUsageLine = (usageAndUsageLine, callback) => {
  let file = usageAndUsageLine.splice(0, 1)[0];
  con.query(`TRUNCATE TABLE ${file.tableName}`, function(err, truncate_response) {
    con.query(`load data infile '${export_file_location}/${file.filename}' into table ${file.tableName} fields terminated by '|#' LINES TERMINATED BY '[#]'`, function(err, insert_reponse) {
      if (err) throw err;
      if (usageAndUsageLine.length) {
        importUsageAndUsageLine(usageAndUsageLine, callback)
      } else {
        callback("DataInserted")
      }
    })
  })
}

app.put('/forget/password', function(req, res, next) {
  const transporter = mailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: 'testhr69@gmail.com',
      pass: 'testhr69'
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





app.post('/get/userData', function(req, res, next) {
  let email = req.body.email || null
  let password = req.body.password || null
  let table = "Customer_Table"
  let barCode = req.body.barCode || null;
  request('http://localhost:3031/get/loginDetails', function(error, response, body) {
    if (email) {
      let findTable = _.filter(JSON.parse(body).data, (filtered_data) => { return filtered_data.name == table })[0];
      let loggedInUser = _.filter(findTable.data, (filtered_data) => { return (filtered_data.EmailAddress == email && filtered_data.Password == password) })[0];
      if (loggedInUser == undefined) {
        table = "Contact_Table"
        findTable = _.filter(JSON.parse(body).data, (filtered_data) => { return filtered_data.name == table })[0];
        loggedInUser = _.filter(findTable.data, (filtered_data) => { return (filtered_data.EmailAddress == email && filtered_data.Password == password) })[0];
        if (loggedInUser == undefined) {
          res.json({ status: 0, message: "Invalid User" })
        } else {
          loggedInUser['tableName'] = table;
          getUserData(loggedInUser, function(response) {
            delete loggedInUser['tableName']
            let user_data = {
              type: "table",
              database: "reorderDB",
              name: table,
              data: [loggedInUser]
            }
            response.data.push(user_data)
            res.json(response)
          })
        }
      } else {
        loggedInUser['tableName'] = table;
        getUserData(loggedInUser, function(response) {
          delete loggedInUser['tableName']
          let user_data = {
            type: "table",
            database: "reorderDB",
            name: table,
            data: [loggedInUser]
          }
          response.data.push(user_data)
          res.json(response)
        })
      }
    } else if (barCode) {
      let findTable = _.filter(JSON.parse(body).data, (filtered_data) => { return filtered_data.name == table })[0];
      let loggedInUser = _.filter(findTable.data, (filtered_data) => { return (filtered_data.LoginBarcode == barCode) })[0];
      if (loggedInUser == undefined) {
        table = "Contact_Table"
        findTable = _.filter(JSON.parse(body).data, (filtered_data) => { return filtered_data.name == table })[0];
        loggedInUser = _.filter(findTable.data, (filtered_data) => { return (filtered_data.LoginBarcode == barCode) })[0];
        if (loggedInUser == undefined) {
          res.json({ status: 0, message: "Invalid User" })
        } else {
          loggedInUser['tableName'] = table;
          getUserData(loggedInUser, function(response) {
            delete loggedInUser['tableName']
            let user_data = {
              type: "table",
              database: "reorderDB",
              name: table,
              data: [loggedInUser]
            }
            response.data.push(user_data)
            res.json(response)
          })
        }
      } else {
        loggedInUser['tableName'] = table;
        getUserData(loggedInUser, function(response) {
          delete loggedInUser['tableName']
          let user_data = {
            type: "table",
            database: "reorderDB",
            name: table,
            data: [loggedInUser]
          }
          response.data.push(user_data)
          res.json(response)
        })
      }
    } else {
      res.json({ status: 0, message: "Invalid Login Type" })
    }
  });
})

app.listen(process.env.PORT || 3031)

console.log("Started on port " + 3031);

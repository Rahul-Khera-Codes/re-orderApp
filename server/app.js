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

let customer_file = 'ppp_Customer_ProductControlCustomer.txt';
let contact_file = 'ppp_Customer_ProductControlContact.txt';

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

function findListData(list_data, email, line_data, callback) {
  let list = list_data.splice(0, 1)[0];
  con.query(`CALL sp_productcontrolline(${list.IDWeb},'${email}')`, function(err, list_line_Data) {
    line_data.push(list_line_Data[0])
    if (list_data.length) {
      findListData(list_data, email, line_data, callback)
    } else {
      line_data = _.flattenDeep(line_data);
      let product_line = [];
      let product = [];
      if (line_data.length) {
        _.forEach(line_data, (val, key) => {
          let Product_Control_Line = {};
          let Product = {};
          _.map(val, (val1, key1) => {
            if (key1 == 'IDLocal' || key1 == 'IDWeb' || key1 == 'ListIDLocal' || key1 == 'ListIDWeb' || key1 == 'ProductIDLocal' || key1 == 'LastUpdatedDateTime') {
              Product_Control_Line[key1] = val1
            } else {
              if (key1 == 'IsActive') {
                Product[key1] = JSON.parse(JSON.stringify(val1)).data[0];
              } else {
                Product[key1] = val1
              }
            }
          })
          product_line.push(Product_Control_Line)
          product.push(Product);
          if (line_data.length == key + 1) {
            let product_id = _.map(product, 'ID');
            con.query(`select * from productcodes where ProductIDLocal IN (${product_id.join()})`, function(err, product_codes) {
              let final_data = [{ type: "table", name: "Product", database: "reorderDB", data: product },
                { type: "table", name: "Product_Control_Line", database: "reorderDB", data: product_line },
                { type: "table", name: "ProductCodes", database: "reorderDB", data: product_codes }
              ]
              callback(final_data)
            })
          }
        })
      } else {
        let product_id = _.map(product, 'ID');
        con.query(`select * from productcodes where ProductIDLocal IN (${product_id.join()})`, function(err, product_codes) {
          let final_data = [{ type: "table", name: "Product", database: "reorderDB", data: product },
            { type: "table", name: "Product_Control_Line", database: "reorderDB", data: product_line },
            { type: "table", name: "ProductCodes", database: "reorderDB", data: product_codes }
          ]
          callback(final_data)
        })
      }
    }
  })
}

function withStoredProcedure(body, callback) {
  let product_list_data = [];
  let product_line_data = [];
  con.query(`CALL sp_productcontrol('${body.email}')`, function(err, list_Data) {
    let List_to_Contact = [];
    list_data = _.filter(list_Data[0], (value) => {
      if (value.ContactIDLocal) {
        let ListData = {
          IDLocal: value.IDLocal,
          IDWeb: value.IDWeb,
          ContactIDLocal: value.ContactIDLocal,
          ContactIDWeb: value.ContactIDWeb,
          ListIDLocal: value.ListIDLocal,
          ListIDWeb: value.ListIDWeb,
          IsActive: JSON.parse(JSON.stringify(value.IsActive)).data[0],
          IsDefault: JSON.parse(JSON.stringify(value.IsDefault)).data[0]
        }
        delete value.ContactIDLocal
        delete value.ContactIDWeb
        delete value.ListIDLocal
        delete value.ListIDWeb
        delete value.IsActive
        List_to_Contact.push(ListData)
      }
      if (value.IsDefault)
        value.IsDefault = JSON.parse(JSON.stringify(value.IsDefault)).data[0]
      if (value.ReLoginToSubmit)
        value.ReLoginToSubmit = JSON.parse(JSON.stringify(value.ReLoginToSubmit)).data[0]
      if (value.IsActive)
        value.IsActive = JSON.parse(JSON.stringify(value.IsActive)).data[0]
      if (value.IsDefaultPCTC)
        value.IsDefaultPCTC = JSON.parse(JSON.stringify(value.IsDefaultPCTC)).data[0]
      return value
    })
    let data = JSON.parse(JSON.stringify(list_Data[0]))
    if (List_to_Contact.length) {
      product_list_data.push({ type: "table", name: "List_to_Contact", database: "reorderDB", data: List_to_Contact })
    }
    product_list_data.push({ type: "table", name: "Product_Control_List", database: "reorderDB", data: _.flattenDeep(list_Data[0]) })
    findListData(data, body.email, product_line_data, function(response) {
      product_list_data.push(response[0])
      product_list_data.push(response[1])
      product_list_data.push(response[2])
      callback({ data: product_list_data })
    })
  })
}


let smtp_data = {}
con.query(`select Value from configuration where ID=3`, function(err, SMTPServer) {
  smtp_data['SMTPServer'] = SMTPServer[0].Value
  con.query(`select Value from configuration where ID=4`, function(err, SMTPPort) {
    smtp_data['SMTPPort'] = SMTPPort[0].Value
    con.query(`select Value from configuration where ID=5`, function(err, SMTPSendSSL) {
      smtp_data['SMTPSendSSL'] = SMTPSendSSL[0].Value
      con.query(`select Value from configuration where ID=6`, function(err, SMTPFromAddress) {
        smtp_data['SMTPFromAddress'] = SMTPFromAddress[0].Value
      })
    })
  })
})
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


app.post("/get/user/data", (req, res) => {
  console.log(req.body)
  withStoredProcedure(req.body, function(response) {
    // readDataFromWebServer(req.body, function(response) {
    res.json({ data: response })
    // })
  })
})
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
//imort data...


app.post('/save/data', function(req, res, next) {
  console.log(req.body)
  let orignal_data = req.body;
  let fileData = "";
  let filtered = _.filter(structure, (filtered_data) => {
    return filtered_data.name == orignal_data.name
  })
  // let file_path = filtered.length ? `../../../tmp/data_files/feeds/CustomerProductControl/${filtered[0].filename}.txt` : `../../../tmp/data_files/feeds/CustomerProductControl/${orignal_data.name + new Date()}.txt`
  let file_path = filtered.length ? `${export_file_location}/${filtered[0].filename}.txt` : `${export_file_location}/${orignal_data.name}_${orignal_data.ListIdLocal}_${moment(new Date()).format('YYYY-MM-DD-hh-mm-ss')}.txt`

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
          if (err) {
            console.log(err);
          } else {
            res.json({ message: "file is saved" })
          }
        })
      });
    })
  } else {
    res.json({ message: "no data for imported" })
  }
})


let importUsageAndUsageLine = (usageAndUsageLine, callback) => {
  let file = usageAndUsageLine.splice(0, 1)[0];
  con.query(`load data infile '${export_file_location}/${file.filename}' into table ${file.tableName} fields terminated by '|#' LINES TERMINATED BY '[#]'`, function(err, insert_reponse) {
    console.log(err)
    if (usageAndUsageLine.length) {
      importUsageAndUsageLine(usageAndUsageLine, callback)
    } else {
      callback("DataInserted")
    }
  })
}

app.put('/forget/password', function(req, res, next) {
  con.query(`select * from customer where EmailAddress="${req.body.email}"`, function(err, customer_details) {
    if (!customer_details.length) {
      con.query(`select * from contact where EmailAddress="${req.body.email}"`, function(err, contact_details) {
        if (!contact_details.length) {
          res.json({ status: 1, message: 'you have entered incorrect email' })
        } else {
          sendUpdatedPassword('contactpasswordrecord', { IDweb: contact_details[0].IDWeb, field: 'ContactIDWeb' }, function(response) {
            res.json({ response: response })
          })
        }
      })
    } else {
      sendUpdatedPassword('customerpasswordrecord', { IDweb: customer_details[0].IDWeb, field: 'CustomerIDWeb' }, function(response) {
        res.json({ response: response })
      })
    }
  })

  function sendUpdatedPassword(tableName, update_info, callback) {
    const transporter = mailer.createTransport({
      host: smtp_data.SMTPServer,
      port: 25,
      secure: false,
      tls:{
        rejectUnauthorized: false
      }
    });
    let mailOptions = {
      from: smtp_data.SMTPFromAddress, // sender address
      to: req.body.email, // list of receivers
      subject: req.body.subject, // Subject line
      text: '', // plain text body
      html: req.body.html // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      con.query(`select * from ${tableName} where ${update_info.field}=${update_info.IDweb}`, function(err, table_data) {
        if (table_data.length) {
          con.query(`update ${tableName} set Password='${req.body.password}' where ${update_info.field}='${update_info.IDweb}'`, function(err, data) {
            callback(info)
          })
        } else {
          con.query(`insert into ${tableName} values(${update_info.IDweb}, '${req.body.password}',now())`, function(err, create_password) {
            callback(info)
          })
        }
      })
    });
  }
})

app.put('/update/password', function(req, res, next) {
  con.query(`select * from customer where EmailAddress='${req.body.EmailAddress}'`, function(err, customer_data) {
    if (customer_data.length) {
      if (customer_data[0].Password == req.body.oldPassword) {
        con.query(`select * from customerpasswordrecord where CustomerIDWeb=${customer_data[0].IDWeb}`, function(err, customerpasswordrecord) {
          if (customerpasswordrecord.length) {
            if (customerpasswordrecord[0].Password == req.body.oldPassword) {
              con.query(`update customerpasswordrecord set Password='${req.body.newPassword}' where CustomerIDWeb='${customerpasswordrecord[0].CustomerIDWeb}'`, function(err, updated_password) {
                res.json({ status: 1, message: "Password Updated Successfully" })
              })
            } else {
              res.json({ status: 0, message: "Incorrect Old Password" })
            }
          } else {
            con.query(`insert into customerpasswordrecord values(${customer_data[0].IDWeb}, '${req.body.newPassword}',now())`, function(err, create_password) {
              res.json({ status: 1, message: "Password Updated Successfully" })
            })
          }
        })
      } else {
        con.query(`select * from customerpasswordrecord where CustomerIDWeb=${customer_data[0].IDWeb}`, function(err, customerpasswordrecord) {
          if (customerpasswordrecord != undefined && customerpasswordrecord.length) {
            if (customerpasswordrecord[0].Password == req.body.oldPassword) {
              con.query(`update customerpasswordrecord set Password='${req.body.newPassword}' where CustomerIDWeb='${customerpasswordrecord[0].CustomerIDWeb}'`, function(err, updated_password) {
                res.json({ status: 1, message: "Password Updated Successfully" })
              })
            } else {
              res.json({ status: 0, message: "Incorrect Old Password" })
            }
          } else {
            res.json({ status: 0, message: "Incorrect Old Password" })
          }
        })
      }
    } else {
      con.query(`select * from contact where EmailAddress='${req.body.EmailAddress}'`, function(err, contact_data) {
        if (contact_data.length) {
          if (contact_data[0].Password == req.body.oldPassword) {
            con.query(`select * from contactpasswordrecord where ContactIDWeb=${contact_data[0].IDWeb}`, function(err, contactpasswordrecord) {
              if (contactpasswordrecord.length) {
                if (contactpasswordrecord[0].Password == req.body.oldPassword) {
                  con.query(`update contactpasswordrecord set Password='${req.body.newPassword}' where ContactIDWeb='${contactpasswordrecord[0].ContactIDWeb}'`, function(err, updated_password) {
                    res.json({ status: 1, message: "Password Updated Successfully" })
                  })
                } else {
                  res.json({ status: 0, message: "Incorrect Old Password" })
                }
              } else {
                con.query(`insert into contactpasswordrecord values(${contact_data[0].IDWeb}, '${req.body.newPassword}',now())`, function(err, create_password) {
                  res.json({ status: 1, message: "Password Updated Successfully" })
                })
              }
            })
          } else {
            con.query(`select * from contactpasswordrecord where ContactIDWeb=${contact_data[0].IDWeb}`, function(err, contactpasswordrecord) {
              if (contactpasswordrecord != undefined && contactpasswordrecord.length) {
                if (contactpasswordrecord[0].Password == req.body.oldPassword) {
                  con.query(`update contactpasswordrecord set Password='${req.body.newPassword}' where ContactIDWeb='${contactpasswordrecord[0].ContactIDWeb}'`, function(err, updated_password) {
                    res.json({ status: 1, message: "Password Updated Successfully" })
                  })
                } else {
                  res.json({ status: 0, message: "Incorrect Old Password" })
                }
              } else {
                res.json({ status: 0, message: "Incorrect Old Password" })
              }
            })
          }
        } else {
          res.json({ status: 0, message: "Invalid User" })
        }
      })
    }
  })
})


app.post('/get/userData', function(req, res, next) {
  let email = req.body.email || null
  let password = req.body.password || null
  let table = "Customer_Table"
  let barCode = req.body.barCode || null;
  con.query(`select * from customer`, function(err, customer_data) {
    con.query(`select * from contact`, function(err, contact_data) {
      if (email) {
        let login_data = [];
        let body = {};
        login_data.push({ type: 'table', name: 'Customer_Table', database: 'reorderDB', data: customer_data })
        login_data.push({ type: 'table', name: 'Contact_Table', database: 'reorderDB', data: contact_data })
        body['data'] = login_data;
        body = JSON.stringify(body)
        let findTable = _.filter(JSON.parse(body).data, (filtered_data) => { return filtered_data.name == table })[0];
        let loggedInUser = _.filter(findTable.data, (filtered_data) => { return (filtered_data.EmailAddress == email) })[0];
        if (loggedInUser == undefined) {
          table = "Contact_Table"
          findTable = _.filter(JSON.parse(body).data, (filtered_data) => { return filtered_data.name == table })[0];
          loggedInUser = _.filter(findTable.data, (filtered_data) => { return (filtered_data.EmailAddress == email) })[0];
          if (loggedInUser == undefined) {
            res.json({ status: 0, message: "Invalid User" })
          } else {
            loggedInUser['tableName'] = table;
            if (loggedInUser && loggedInUser.Password == password) {
              con.query(`select * from contactpasswordrecord where  ContactIDWeb=${loggedInUser.IDWeb}`, function(err, password_record) {
                if (password_record.length) {
                  if (password_record[0].Password == password) {
                    withStoredProcedure(req.body, function(response) {
                      delete loggedInUser['tableName']
                      loggedInUser = _.filter([loggedInUser], (value) => {
                        value.JobIDForce = JSON.parse(JSON.stringify(value.JobIDForce)).data[0]
                        value.Password = password
                        return value
                      })
                      let user_data = {
                        type: "table",
                        database: "reorderDB",
                        name: table,
                        data: loggedInUser
                      }
                      response.data.push(user_data)
                      res.json(response)
                    })
                  } else {
                    res.json({ status: 0, message: "Invalid Password" })
                  }
                } else {
                  withStoredProcedure(req.body, function(response) {
                    delete loggedInUser['tableName']
                    loggedInUser = _.filter([loggedInUser], (value) => {
                      value.JobIDForce = JSON.parse(JSON.stringify(value.JobIDForce)).data[0]
                      value.Password = password
                      return value
                    })
                    let user_data = {
                      type: "table",
                      database: "reorderDB",
                      name: table,
                      data: loggedInUser
                    }
                    response.data.push(user_data)
                    res.json(response)
                  })
                }
              })
            } else {
              con.query(`select * from contactpasswordrecord where  ContactIDWeb=${loggedInUser.IDWeb} AND Password='${password}'`, function(err, customer_password_data) {
                if (customer_password_data.length) {
                  withStoredProcedure(req.body, function(response) {
                    delete loggedInUser['tableName']
                    loggedInUser = _.filter([loggedInUser], (value) => {
                      value.JobIDForce = JSON.parse(JSON.stringify(value.JobIDForce)).data[0]
                      value.Password = password
                      return value
                    })
                    let user_data = {
                      type: "table",
                      database: "reorderDB",
                      name: table,
                      data: loggedInUser
                    }
                    response.data.push(user_data)
                    res.json(response)
                  })
                } else {
                  res.json({ status: 0, message: "Invalid User" })
                }
              })
            }

          }
        } else {
          loggedInUser['tableName'] = table;
          if (loggedInUser && loggedInUser.Password == password) {
            con.query(`select * from customerpasswordrecord where CustomerIDWeb=${loggedInUser.IDWeb}`, function(err, customer_password_data) {
              if (customer_password_data.length) {
                if (customer_password_data[0].Password == password) {
                  withStoredProcedure(req.body, function(response) {
                    delete loggedInUser['tableName']
                    loggedInUser = _.filter([loggedInUser], (value) => {
                      value.JobIDForce = JSON.parse(JSON.stringify(value.JobIDForce)).data[0]
                      value.Password = password
                      return value
                    })
                    let user_data = {
                      type: "table",
                      database: "reorderDB",
                      name: table,
                      data: loggedInUser
                    }
                    response.data.push(user_data)
                    res.json(response)
                  })
                } else {
                  res.json({ status: 0, message: "Invalid Password" })
                }
              } else {
                withStoredProcedure(req.body, function(response) {
                  delete loggedInUser['tableName']
                  loggedInUser = _.filter([loggedInUser], (value) => {
                    value.JobIDForce = JSON.parse(JSON.stringify(value.JobIDForce)).data[0]
                    value.Password = password
                    return value
                  })
                  let user_data = {
                    type: "table",
                    database: "reorderDB",
                    name: table,
                    data: loggedInUser
                  }
                  response.data.push(user_data)
                  res.json(response)
                })
              }
            })
          } else {
            con.query(`select * from customerpasswordrecord where CustomerIDWeb=${loggedInUser.IDWeb} AND Password='${password}'`, function(err, customer_password_data) {
              if (customer_password_data.length) {
                withStoredProcedure(req.body, function(response) {
                  delete loggedInUser['tableName']
                  loggedInUser = _.filter([loggedInUser], (value) => {
                    value.JobIDForce = JSON.parse(JSON.stringify(value.JobIDForce)).data[0]
                    value.Password = password
                    return value
                  })
                  let user_data = {
                    type: "table",
                    database: "reorderDB",
                    name: table,
                    data: loggedInUser
                  }
                  response.data.push(user_data)
                  res.json(response)
                })
              } else {
                res.json({ status: 0, message: "Invalid User" })
              }
            })
          }
        }
      } else if (barCode) {
        let login_data = [];
        let body = {};
        login_data.push({ type: 'table', name: 'Customer_Table', database: 'reorderDB', data: customer_data })
        login_data.push({ type: 'table', name: 'Contact_Table', database: 'reorderDB', data: contact_data })
        body['data'] = login_data;
        body = JSON.stringify(body)
        let findTable = _.filter(JSON.parse(body).data, (filtered_data) => { return filtered_data.name == table })[0];
        let loggedInUser = _.filter(findTable.data, (filtered_data) => { return (filtered_data.LoginBarcode == barCode) })[0];
        if (loggedInUser == undefined) {
          table = "Contact_Table"
          findTable = _.filter(JSON.parse(body).data, (filtered_data) => { return filtered_data.name == table })[0];
          loggedInUser = _.filter(findTable.data, (filtered_data) => { return (filtered_data.LoginBarcode == barCode) })[0];
          if (loggedInUser == undefined) {
            res.json({ status: 0, message: "Invalid User" })
          } else {
            con.query(`select * from contactpasswordrecord where ContactIDWeb=${loggedInUser.IDWeb}`, function(err, data) {
              if (data.length)
                password = data[0].Password;
            })
            loggedInUser['tableName'] = table;
            withStoredProcedure({ email: loggedInUser.EmailAddress }, function(response) {
              delete loggedInUser['tableName']
              loggedInUser = _.filter([loggedInUser], (value) => {
                value.JobIDForce = JSON.parse(JSON.stringify(value.JobIDForce)).data[0]
                value.Password = password != null ? password : value.Password
                return value
              })
              let user_data = {
                type: "table",
                database: "reorderDB",
                name: table,
                data: loggedInUser
              }
              response.data.push(user_data)
              res.json(response)
            })
          }
        } else {
          con.query(`select * from customerpasswordrecord where CustomerIDWeb=${loggedInUser.IDWeb}`, function(err, data) {
            if (data.length)
              password = data[0].Password;
          })
          loggedInUser['tableName'] = table;
          withStoredProcedure({ email: loggedInUser.EmailAddress }, function(response) {
            delete loggedInUser['tableName']
            loggedInUser = _.filter([loggedInUser], (value) => {
              value.JobIDForce = JSON.parse(JSON.stringify(value.JobIDForce)).data[0]
              value.Password = password != null ? password : value.Password
              return value
            })
            let user_data = {
              type: "table",
              database: "reorderDB",
              name: table,
              data: loggedInUser
            }
            response.data.push(user_data)
            res.json(response)
          })
        }
      } else {
        res.json({ status: 0, message: "Invalid Login Type" })
      }
    })
  })
})

app.get('/search/product/:SearchText/:page/:limit', function(req, res, next) {
  req.params.SearchText = req.params.SearchText.trim();
  let array = req.params.SearchText.split(" ")
  console.log(array)
  let sql = `SELECT * from product where`;
  _.forEach(array, (value, key) => {
    sql = `${sql} SearchText LIKE '%${value}%' ${(key < (array.length-1)*1)?'and':''}`;
  })
  con.query(`${sql} LIMIT ${req.params.limit} OFFSET ${(req.params.page - 1) * req.params.limit}`, function(err, resp) {
    if (err) throw err;
    res.json({ status: 1, data: resp })
  })
})

app.get('/search/barcode/:Barcode', function(req, res, next) {
  con.query(`SELECT * FROM productcodes WHERE BarCode = '${req.params.Barcode}'`, function(err, resp) {
    if (err) throw err;
    let ProductIDLocal = ''
    if (resp.length != 0) {
      ProductIDLocal = resp[0].ProductIDLocal;
    }
    con.query(`SELECT * FROM product WHERE ID = '${ProductIDLocal}' OR code = '${req.params.Barcode}' OR BarCode1='${req.params.Barcode}' OR BarCode2='${req.params.Barcode}' OR BarCode3='${req.params.Barcode}'`, function(err, data) {
      if (err) throw err;
      res.json({ status: 1, data: data })
    })
  })
})

app.listen(process.env.PORT || 3031)

console.log("Started on port " + 3031);

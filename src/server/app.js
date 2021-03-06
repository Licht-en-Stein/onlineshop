const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const Router = express.Router;
const mailnotifier = require('./mailnotifier');
const jwt = require('jsonwebtoken');
const serverSignature = 'Secret Server Signature';
const bcrypt = require('bcryptjs');
const port = 9090;

let osFolder = process.env.HOME + '/.online_shop';
let shopConfig = null;
if (!fs.existsSync(osFolder)) {
  fs.mkdirSync(osFolder);
  let initialConfig = {
    mysql_user: '',
    mysql_db: '',
    mysql_pwd: '',
    mailnotifications: 0,
  }
  fs.writeFileSync(osFolder + '/.config.json', JSON.stringify(initialConfig));
  console.log('The config folder does not exist, it has been created now. The server will exit now');
  process.exit();

} else {
  shopConfig = require(osFolder + '/.config.json');
}

const con = mysql.createConnection({
  host: 'localhost',
  user: shopConfig.mysql_user,
  password: shopConfig.mysql_pwd,
  database: shopConfig.mysql_db,
});

const frontendDirectoryPath = path.resolve(__dirname, './../static');

console.info('Static resource on: ', frontendDirectoryPath);
app.use(bodyParser.json());

app.use(express.static(frontendDirectoryPath));
// CORS on ExpressJS to go over the port limitations on the same machine
app.use(cors());
/*Old fashion way
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/
// always want to have /api in the begining

const apiRouter = new Router();
app.use('/api', apiRouter);

apiRouter.get('/', (req, res) => {
  res.send({ 'shop-api': '1.0' });
});


apiRouter.post('/register', (req, res) => {
  con.query('select email from customers where email = ?', [req.body.email],
    function(err, rows) {
      if (err)
        throw err;
      if (rows.length > 0) {
        return res.json({ err: 'The email is already in use.' });
      } else {
        con.query('INSERT INTO customers (firstname,lastname,birthdate,phone,city,street,postal,email,pwd) VALUES (?,?,?,?,?,?,?,?,?)', [req.body.firstname,
            req.body.lastname,
            req.body.birthdate,
            req.body.phone,
            req.body.city,
            req.body.street,
            req.body.postal,
            req.body.email,
            req.body.password
          ],
          (err, rows) => {
            if (err) {
              throw err;
            } else {
              console.log(rows);
              res.json({

                id: rows.insertId, 
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                birthdate: req.body.birthdate,
                phone: req.body.phone,
                city: req.body.city,
                street: req.body.street,
                postal: req.body.postal,
                email: req.body.email,
                token: req.body.password,
              });
            }
          });
      }
    });
})

// login token

apiRouter.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.json({ err: 'Mail and password required' });
  }

  con.query('select * from customers where email = ?', [req.body.email], (err, rows) => {
    if (err) {
      return res.json({ err: 'Internal error occured' });
    }
    if (rows.length > 0 && bcrypt.compareSync(rows[0].pwd, req.body.password)) {

      const token = jwt.sign({ email: rows[0].email, pwd: rows[0].pwd }, serverSignature);
      return res.json({
        id: rows[0].id,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        birthdate: rows[0].birthdate,
        email: rows[0].email,
        phone: rows[0].phone,
        city: rows[0].city,
        postal: rows[0].postal,
        street: rows[0].street,
        token: token,
      });

    } else {
      return res.json({ err: 'Username/Passowrd does not exist' });
    }
  });
});

///////

// Conect to MySQL
apiRouter.get('/products', (req, res) => {
  con.query('select * from products', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.type('json');
      res.send(rows);
    }
  });
});

apiRouter.get('/categories', (req, res) => {
  con.query('select * from product_categories', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.type('json');
      res.send(rows);
    }
  });
});
///MySQL END
apiRouter.get('/activecustomers', (req, res) => {
  con.query('select id from customers where active = 1 ', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.json(rows);
    }
  });
});

apiRouter.get('/customers/:userid', (req, res) => {
  con.query('select * from customers where active = 1 and id = ?', [req.params.userid], (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.json(rows);
    }
  });
});

apiRouter.get('/payment_methods', (req, res) => {
  con.query('SELECT * FROM payment_methods', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.json(rows);
    }
  });
});

apiRouter.put('/activate/:userid', (req, res) => {
  con.query('UPDATE customers set active = ? where id = ?', [req.body.status, req.params.userid],
    (err, rows) => {
      if (err)
        throw err;
      res.json(rows);
    });
});
// postUser.sh
/*
apiRouter.post('/user', (req, res) => {

  con.query('select email from customers where email = ?', [req.body.email],
    function(err, rows) {
      if (err)
        throw res.json();
      if (rows.length > 0) {
        res.json('The email ' + [req.body.email] + ' its already in use.');
      } else {
        con.query('INSERT INTO customers (firstname,lastname,birthdate,phone,city,street,postal,email) VALUES (?,?,?,?,?,?,?,?)', [req.body.firstname,
            req.body.lastname,
            req.body.birthdate,
            req.body.phone,
            req.body.city,
            req.body.street,
            req.body.postal,
            req.body.email
          ],
          (err, rows) => {
            if (err) {
              throw err;
            } else {
              res.json(rows);
            }
          });
      }
    });
});
*/

//postOrder.sh
apiRouter.post('/order', (req, res) => {
  /* 
   fs.writeFile(path.resolve(__dirname, './../../orders/orders'+Date.now()+'.txt'), JSON.stringify(req.body),
     (err)=>{
       if(err)
         res.json({error: err});
       res.json({success:'order saved'})
     });
     */

  con.query('INSERT INTO orders (customer_id,created,payment_method_id) VALUES (?,now(),?)', [req.body.user.customer_id, req.body.payment_method_id],
    (err, rows) => {
      if (err) {
        throw err;
      } else {
        const orderID = rows.insertId;
        let sql = 'INSERT INTO order_details (order_id,product_id,price) VALUES ';
        for (let i = 0; i < req.body.products.length; i += 1) {
          const p = req.body.products[i];
          let values = '(' + orderID + ',' + p.id + ',' + p.price + ')';
          sql += values;
          if (i < req.body.products.length - 1) {
            sql += ','
          }
        }

        con.query(sql, (err, rows) => {
          if (shopConfig.mailnotifications === '1') {
            let text = `<h1>Dear ${req.body.user.name},</h1>
            <p> Thank you very much for ordering over our shop.
            Your final sum of your placed order is ${req.body.total_price}€.
            Cheerio 
            enjoy your products</p>
            `
            const subject = 'Your shopping list';
            mailnotifier.sendMail(req.body.user.customer_email, subject, text)
          }
          return res.json(rows);
        });
      }
    });
});

// modifyUser.sh
apiRouter.put('/user/:userid', (req, res) => {
  var sql = 'UPDATE customers set ';
  // console.info('user id: ', req.params.userid);
  var i = 1;
  var bodyLength = Object.keys(req.body).length;
  var values = [];
  for (var field in req.body) {
    sql += field + ' = ?';
    if (i < bodyLength)
      sql += ',';
    i++;
    values.push(req.body[field]);
    // console.info('field is:',field);
    // console.info('value is:',req.body[field]);
  }
  sql += 'where id = ?';
  values.push(req.params.userid);
  con.query(sql, values,
    (err, rows) => {
      if (err)
        throw err;
      res.json(rows);
    });
});

apiRouter.delete('/delete/:userid', (req, res) => {
  con.query('UPDATE customers set deleted = now() where id = ?', [req.params.userid],
    (err, rows) => {
      if (err)
        throw err;
      res.json(rows);
    });
});

apiRouter.get("*", (req, res) => {
  res.send('404 Sorry we couldnt find what you requested');
});

app.listen(port, (err) => {
  if (err) throw err;
  console.info('Server started on port', port);
});

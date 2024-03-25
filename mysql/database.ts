const mysql = require('mysql2');
require('dotenv').config({ path: "../.env" });

const pool = mysql.createConnection({
    host: process.env.DEVELOP_SQL_DOMAIN,
    user: process.env.DEVELOP_SQL_USER,
    password: process.env.DEVELOP_SQL_PASS,
    database: process.env.DEVELOP_SQL
});
// @ts-ignore
pool.connect((err) => {
    if (!!err) {
        console.log(err)
    }
})

module.exports = pool;
  

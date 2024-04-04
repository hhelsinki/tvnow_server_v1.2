//@ts-ignore
var crypto = require('crypto');
// Create the generator:
var randtoken = require('rand-token').generator({
    chars: 'base32',
    //@ts-ignore
    source: crypto.randomBytes
});

require('dotenv').config({ path: ".env" });
const pools = require('../mysql/database.ts');

// Generate a 16 character token:
const token = randtoken.generate(16);

function insertGiftcard() {
    //@ts-ignore
    pools.query('INSERT INTO giftcard (code) VALUES (?)', [token], (err, result) => {
        if (err) throw err;
        console.log(result);
    })
}

insertGiftcard();

console.log(token);
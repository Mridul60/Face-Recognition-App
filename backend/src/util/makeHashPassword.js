const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
    const hash = await bcrypt.hash(plainPassword, 10
    );
    console.log('Hashed Password:', hash);
}

hashPassword('abc');

const bcrypt = require('bcryptjs');
var MD5 = require('md5');

const generatePassword = (password) => {
    return bcrypt.hashSync(password, 10);
}

const checkPassword = (password, hash) => {
    if(MD5(password) == hash){
        return true;
    }else{
        return false;
    }
  
    // return bcrypt.compareSync(password, hash);
}



module.exports = {
    generatePassword,
    checkPassword
}
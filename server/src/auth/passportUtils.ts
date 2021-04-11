import crypto from 'crypto';

//for registration
function generatePassword(password: string) {
    var salt : string = crypto.randomBytes(32).toString('hex'); //random hex to create more random hash value
    var hashedPass : string = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex'); //https://tools.ietf.org/html/rfc8018 algo and salt explanation

    return {
        salt: salt,
        hash: hashedPass
    };
}

function validPassword(password: string, hash: string, salt: string) : boolean { 
    var verify : string = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verify;
}

export {validPassword as validPassword};
export {generatePassword as generatePassword};

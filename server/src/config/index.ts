import dotenv from 'dotenv';
dotenv.config();

module.exports = {
    PORT : process.env.SERVER_PORT,
    SECRET : process.env.APP_SECRET
}

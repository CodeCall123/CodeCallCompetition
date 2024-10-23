const {config} = require('dotenv');
config();

const {CLIENT_URLS} = process.env;

exports.Config = {
    CLIENT_URLS
}
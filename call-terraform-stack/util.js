const axios = require('axios');
const config = require('./config');

module.exports = {
    axios,

    //** simply post to the log proxy for local logging
    log: async (msg) => {
        console.log(msg);
        await axios.post(config.logUrl, { message: msg });
    }
}

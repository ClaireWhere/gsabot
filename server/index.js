const express = require('express');
const { getMessageLog } = require('../utils/db.utils/messageLogger');
const { logger } = require('../utils/logger');

require('dotenv').config();
const PORT = process.env.APP_PORT || 8080;

var app = express();

app.get('/logs/*', async function(req, res) {
    const id = req.path.split('/')[2];
    var m = getMessageLog(id);
    logger.info(`[RESPONSE] ` + (m != null ? `retrieved data for ${id}` : `no log found for ${id}`))
    res.send(!m ? `no log found for ${id}.` : m.content);
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
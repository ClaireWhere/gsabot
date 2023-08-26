const express = require('express');
const { getMessageLog, verifyMessageId } = require('../utils/messageLogger');
const { debug } = require('../utils/debugger');

require('dotenv').config();
const PORT = process.env.APP_PORT || 8080;

var app = express();

app.get('/logs/*', async function(req, res) {
    const id = req.path.split('/')[2];
    if (!verifyMessageId(id)) {
        debug(`invalid id specified: ${id}`)
        res.status(404).send(`no log found for ${id}.`);
        return;
    }
    var m = getMessageLog(id);
    debug(`[RESPONSE] ` + (m != null ? `retrieved data for ${id}` : `no log found for ${id}`))
    res.send(m != null ? m.content : `no log found for ${id}.`);
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
const express = require("express");
const logsRouter = express.Router();

const { verifyMessageId, getMessageLog } = require('../../utils/db.utils/messageLogger')
const { LoggedMessage } = require('../../models/LoggedMessage');
const { requiresAuth } = require('express-openid-connect');


logsRouter.get('/', function(req, res, next) {
    res.redirect(req.baseUrl + '/search')
});

logsRouter.get('/search', requiresAuth(), function (req, res, next) {
    const id = req.query.id;
    if (!id) {
        res.render('logs');
        return;
    }

    var send = { logId: -1, id: id };
    if (verifyMessageId(id)) {
        var m = (getMessageLog(id));
        console.log(`[RESPONSE] ` + (m != null ? `retrieved data for ${id}` : `no log found for ${id}`));
        send = !m ? {logId: -1, id: id} : {logId: id, loggedMessage: m};
    }
    res.render('logs', send);
});

module.exports = { logsRouter }
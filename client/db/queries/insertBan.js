const { client, healthy } = require('../db');
const { logger } = require('../../utils/logger');
const { uniqueBanTypes } = require('../../utils/banTypes');

uniqueBanTypes.forEach(banType => {
    const query = `INSERT INTO ban_type (ban_type_name) SELECT '${banType}' WHERE NOT EXISTS (SELECT * FROM ban_type WHERE ban_type_name = '${banType}');`;

    if (!healthy) {
        throw new Error('No database connection.');
    }
    
    client.query(query, (queryError) => {
        if (queryError) {
            throw queryError;
        } else {
            logger.info(`Ban type "${banType}" initialized`);
        }
    });
});

/**
 * 
 * @param {string} banID 
 * @param {string} userID 
 * @param {"banned"|"unbanned"|"banning"|"unbanning"} banRole 
 * @returns {Promise<void>}
 */
function addBanParticipant(banID, userID, banRole) {
    const query = `
        INSERT INTO ban_participant (
            ban_id,
            user_id,
            ban_role_id
        ) VALUES ($1, $2, (SELECT ban_role.id FROM ban_role WHERE role_type_name = $3));
    `;
    const values = [banID, userID, banRole];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError) => {
            if (queryError) {
                reject(queryError);
            } else {
                logger.info(`Recorded User ${userID} as "${banRole}" for ban ${banID}`);
                resolve();
            }
        });
    });
}


/**
 * 
 * @param {string} banType The type of ban to apply. Must be one of the ban types specified in the config.
 * @param {string} guildID The ID of the guild where the ban is being applied
 * @param {string} reason
 * @returns {Promise<string>} The ID of the inserted ban
 */
function addBan(banType, guildID, reason) {
    if (!uniqueBanTypes.includes(banType)) {
        throw new Error(`Invalid ban type: ${banType}`);
    }

    const query = `
        INSERT INTO ban (
            ban_type_id,
            guild_id,
            reason
        ) VALUES (
            (SELECT ban_type.id FROM ban_type WHERE ban_type_name = $1), 
            $2, 
            $3
        ) RETURNING ban.id;
    `;
    const values = [banType, guildID, reason];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                reject(queryError);
            } else {
                const banID = queryResponse.rows.shift().id;
                logger.info(`Ban inserted with ID: ${banID}`);
                resolve(banID);
            }
        });
    });
}

/**
 * 
 * @param {string} userID The ID of the user to check
 * @param {string} guildID The ID of the guild where the ban is being checked
 * @param {string} banType The type of ban to check. Must be one of the ban types specified in the config.
 * @returns {Promise<string|null>} The ID of the ban, or null if the user is not banned
 */
function getBanID(userID, guildID, banType) {
    if (!uniqueBanTypes.includes(banType)) {
        throw new Error(`Invalid ban type: ${banType}`);
    }

    const query = `
        SELECT 
            ban.id 
        FROM ban 
        JOIN ban_participant bp
            ON ban.id = bp.ban_id
        JOIN ban_type bt
            ON ban.ban_type_id = bt.id
        WHERE 
            bp.user_id = $1 AND 
            bp.ban_role_id = (SELECT ban_role.id FROM ban_role WHERE ban_role.role_type_name = 'banned') AND
            bt.ban_type_name = $2 AND 
            ban.guild_id = $3 AND 
            ban.is_active = true;
    `;
    const values = [userID, banType, guildID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                reject(queryError);
            } else if (queryResponse.rows.length === 0) {
                    resolve(null);
            } else {
                resolve(queryResponse.rows.shift().id);
            }
        });
    });
}

/**
 * 
 * @param {string} banID The ID of the ban to disable
 * @returns {Promise<void>}
 */
function disableBan(banID) {
    const query = `
        UPDATE ban 
        SET 
            is_active = false, 
            unbanned_at = NOW() 
        WHERE id = $1;
    `;
    const values = [banID];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError) => {
            if (queryError) {
                reject(queryError);
            } else {
                logger.info(`Ban ${banID} disabled`);
                resolve();
            }
        });
    });
}



/**
 * 
 * @param {string} userID The ID of the user to ban
 * @param {string} guildID The ID of the guild where the ban is being applied
 * @param {string} reason 
 * @param {string} bannedBy The ID of the user who banned the user
 * @param {string} banType The type of ban to apply. Must be one of the ban types specified in the config.
 * @returns {Promise<void>}
 */
function banUser(userID, guildID, reason, bannedBy, banType) {
    return new Promise((resolve, reject) => {
        if (!uniqueBanTypes.includes(banType)) {
            reject(new Error(`Invalid ban type: ${banType}`));
        }

        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        
        addBan(banType, guildID, reason)
            .then(banID => {
                addBanParticipant(banID, userID, 'banned')
                    .then(() => {
                        addBanParticipant(banID, bannedBy, 'banning')
                            .then(() => {
                                resolve();
                            })
                            .catch(error => {
                                reject(error);
                            });
                    })
                    .catch(error => {
                        reject(error);
                    });
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * 
 * @param {string} userID The ID of the user to unban
 * @param {string} guildID The ID of the guild where the ban is being removed
 * @param {string} unbannedBy The ID of the user who unbanned the user
 * @param {string} banType The type of ban to unban. Must be one of the ban types specified in the config.
 * @returns {Promise<void>}
 */
function unbanUser(userID, guildID, unbannedBy, banType) {
    return new Promise((resolve, reject) => {
        if (!uniqueBanTypes.includes(banType)) {
            reject(new Error(`Invalid ban type: ${banType}`));
        }

        if (!healthy) {
            reject(new Error('No database connection.'));
        }

        getBanID(userID, guildID, banType)
            .then(banID => {
                if (banID) {
                    logger.debug(`Disabling ban ${banID}`);
                    disableBan(banID)
                        .then(() => {
                            logger.debug(`Ban ${banID} disabled`);
                            addBanParticipant(banID, unbannedBy, 'unbanning')
                                .then(() => {
                                    logger.debug(`User ${userID} unbanned by ${unbannedBy}`);
                                    addBanParticipant(banID, userID, 'unbanned')
                                        .then(() => {
                                            logger.debug(`User ${userID} unbanned`);
                                            resolve();
                                        })
                                        .catch(error => {
                                            reject(error);
                                        });
                                })
                                .catch(error => {
                                    reject(error);
                                });
                        })
                        .catch(error => {
                            reject(error);
                        });
                } else {
                    resolve();
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * 
 * @param {string} guildID The ID of the guild to check
 * @returns {Promise<[{string: [{reason: string, is_active: boolean, banned_at: string, unbanned_at: string|null, bannee_id: string, banner_id: string, unbanner_id: string|null}]}]>} The list of bans in the guild, grouped by ban type
 */
function getBanList(guildID) {
    /**
     * Example:
     * [{politics: [{
     * reason: 'reason',
     * is_active: true,
     * banned_at: 'timestamp',
     * unbanned_at: 'timestamp',
     * bannee_id: 'user_id',
     * banner_id: 'user_id',
     * ban_timestamp: 'timestamp',
     * unbanner_id: 'user_id'
     * }, {
     * ...
     * }]}, {safeSpace: [{...}, ]]
     */
    
    const query = `
        SELECT 
            b.reason AS reason,
            b.is_active AS is_active,
            b.banned_at AS ban_timestamp,
            b.unbanned_at AS unban_timestamp,
            bt.ban_type_name AS ban_type,
            bannee.user_id AS bannee_id,
            banner.user_id AS banner_id,
            unbanner.user_id AS unbanner_id
        FROM ban b
        JOIN ban_type bt ON b.ban_type_id = bt.id
        JOIN ban_participant bannee ON b.id = bannee.ban_id AND bannee.ban_role_id = (SELECT id FROM ban_role WHERE role_type_name = 'banned')
        JOIN ban_participant banner ON b.id = banner.ban_id AND banner.ban_role_id = (SELECT id FROM ban_role WHERE role_type_name = 'banning')
        LEFT JOIN ban_participant unbanner ON b.id = unbanner.ban_id AND unbanner.ban_role_id = (SELECT id FROM ban_role WHERE role_type_name = 'unbanning')
        WHERE b.guild_id = $1
        ORDER BY b.banned_at DESC;
    `;
    const values = [guildID];

    const banList = {}
    uniqueBanTypes.forEach(banType => {
        banList[banType] = [];
    });

    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                reject(queryError);
            } else {
                queryResponse.rows.forEach(row => {
                    const ban = {
                        reason: row.reason,
                        is_active: row.is_active,
                        banned_at: row.ban_timestamp,
                        unbanned_at: row.unban_timestamp,
                        bannee_id: row.bannee_id,
                        banner_id: row.banner_id,
                        unbanner_id: row.unbanner_id
                    };
                    banList[row.ban_type].push(ban);
                });
                resolve(banList);
            }
        });
    });
}

/**
 * 
 * @param {string} userID The ID of the user to check
 * @param {string} guildID The ID of the guild where the ban is being checked
 * @param {string} banType The type of ban to check. Must be one of the ban types specified in the config.
 * @returns {Promise<boolean>} Whether the user is currently banned in the guild (ignoring past bans)
 */
function isBanned(userID, guildID, banType) {
    if (!uniqueBanTypes.includes(banType)) {
        throw new Error(`Invalid ban type: ${banType}`);
    }

    const query = `
        SELECT ban.id 
        FROM ban 
        JOIN ban_type bt 
            ON ban.ban_type_id = bt.id 
        JOIN ban_participant bp
            ON ban.id = bp.ban_id
        WHERE 
            bp.user_id = $1 AND 
            bp.ban_role_id = (SELECT ban_role.id FROM ban_role WHERE ban_role.role_type_name = 'banned') AND
            ban.guild_id = $2 AND 
            bt.ban_type_name = $3 AND 
            ban.is_active = true;
    `;
    const values = [userID, guildID, banType];
    return new Promise((resolve, reject) => {
        if (!healthy) {
            reject(new Error('No database connection.'));
        }
        client.query(query, values, (queryError, queryResponse) => {
            if (queryError) {
                reject(queryError);
            } else {
                resolve(queryResponse.rows.length > 0);
            }
        });
    });
}

module.exports = {banUser, unbanUser, getBanList, isBanned};
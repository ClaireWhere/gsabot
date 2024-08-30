const config = require('../config.json').config;

const uniqueBanTypes = config.channel_bans.ban_types.reduce((accumulator, currentBanType) => {
    const existingBanType = accumulator.find(item => {return item.id_name === currentBanType.id_name});
    if (!existingBanType) {
        return accumulator.concat([currentBanType]);
    }
    return accumulator;
}, []).map(banType => {return banType.id_name});

const uniqueBanChoices = config.channel_bans.ban_types.reduce((accumulator, currentBanType) => {
    const existingBanType = accumulator.find(item => {return item.id_name === currentBanType.id_name});
    if (!existingBanType) {
        return accumulator.concat([currentBanType]);
    }
    return accumulator;
}, []).map(banType => {return {name: banType.display_name, value: banType.id_name}});

function getBanTypeDisplay(banType) {
    const banTypeData = config.channel_bans.ban_types.find(item => {return item.id_name === banType});
    return banTypeData.display_name;
}

module.exports = {
    uniqueBanTypes, uniqueBanChoices, getBanTypeDisplay
};
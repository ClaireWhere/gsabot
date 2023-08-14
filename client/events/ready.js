module.exports = {
    name: 'ready', // the event that this file is for
    once: true, // specifies this event should only run once
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};
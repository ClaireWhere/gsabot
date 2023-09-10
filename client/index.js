const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, InteractionType } = require('discord.js');
require('dotenv').config();
const minecraftTracker = require('./events/minecraftTracker');
const { config } = require('./config.json');
const { logger } = require('../utils/logger');

logger.info(`Starting client...`);

const presence = config.custom_status.enabled ? {activities: [{name: config.custom_status.name, type: ActivityType.Custom, state: config.custom_status.state}], state: config.custom_status.state} : {}
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
    presence: presence
});


// Initialize Events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    logger.info(`registered event: ${event.name} from ${file}`)
}


// Initialize Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    try {
        client.commands.set(command.data.name, command);
        logger.info(`initialized command: ${command.data.name}`);
    } catch (error) {
        logger.error(`could not load command from file ${file}: ${error}`);
    }
}

// Command handler
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    logger.info(`received ${InteractionType[interaction.type]} interaction /${interaction.commandName} from ${interaction.member.user.username}`);

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    await command.execute(interaction)
        .then((res) => {
            logger.info(`${interaction.commandName} command execution completed with status ${res}`)
        }).catch(async (error) => {
            await interaction.followUp({content: 'There was an error D:', ephemeral: true})
                .then((res) => {
                    logger.warn(`${interaction.commandName} command executed with error. Application successfully sent error message`)
                }).catch((err) => {
                    logger.error(`${interaction.commandName} command was unable to be executed. Application did not respond in time: ${error}`);
                    return false;
                });
        });
    
});

client.login(process.env.DISCORD_TOKEN);


process.on('beforeExit', async () => {
    minecraftTracker.stop();
    process.exit(0)
});
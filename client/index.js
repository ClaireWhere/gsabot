const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, InteractionType } = require('discord.js');
require('dotenv').config();
const minecraftTracker = require('./events/minecraftTracker');
const { config } = require('./config.json');
const { logger } = require('./utils/logger');

logger.info(`Starting client with id ${process.env.CLIENT_ID}...`);

function getPresence() {
    try {
        return config.custom_status.enabled ? {activities: [{name: config.custom_status.name, type: ActivityType.Custom, state: config.custom_status.state}], state: config.custom_status.state} : {}
    } catch (error) {
        logger.error(`Error while loading custom status: ${error}`);
        return {}
    }
}
function getIntents() {
    try {
        return [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers];
    } catch (error) {
        logger.error(`Error while loading intents: ${error}`);
        return []
    }
}

function getClient() {
    try {
        return new Client({
            intents: getIntents(),
            presence: getPresence()
        });
    } catch (error) {
        logger.error(`Error while initializing client: ${error}`);
        return null;
    }
}


const client = getClient();

if (client) {
    logger.info(`Client initialized with presence ${JSON.stringify(getPresence())} and intents ${getIntents().join(', ')}`);
} else {
    logger.error(`Client could not be initialized. Exiting...`);
    process.exit(1);
}

// Initialize Events
const eventFiles = fs.readdirSync(`${__dirname}/events`).filter(file => {return file.endsWith('.js')});
let eventsLoaded = 0;
logger.info(`Found ${eventFiles.length} events to load`);

eventFiles.forEach(file => {
    try {
        logger.debug(`loading event from ${file} (full path: ${__dirname}/events/${file})`);
        const event = require(`${__dirname}/events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => {return event.execute(...args)});
        } else {
            client.on(event.name, (...args) => {return event.execute(...args)});
        }
        logger.debug(`registered event: ${event.name} from ${file}`)
        eventsLoaded++;
    } catch (error) {
        logger.error(`There was an error loading event from file ${file}: ${error}`);
    }
});
logger.info(`Loaded ${eventsLoaded} / ${eventFiles.length} events`);

// Initialize Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => {return file.endsWith('.js')});
let commandsLoaded = 0;
logger.info(`Found ${commandFiles.length} commands to load`);

for (const file of commandFiles) {
    try {
        logger.debug(`loading command from ${file} (full path: ${__dirname}/commands/${file})`);
        const command = require(`${__dirname}/commands/${file}`);

        client.commands.set(command.data.name, command);
        logger.debug(`registered command: ${command.data.name} from ${file}`);
        commandsLoaded++;
    } catch (error) {
        logger.error(`There was an error loading command from file ${file}: ${error}`);
    }
}
logger.info(`Loaded ${commandsLoaded} / ${commandFiles.length} commands`);

// Command handler
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) {return;}

    logger.info(`received ${InteractionType[interaction.type]} interaction /${interaction.commandName} from ${interaction.member.user.username}`);

    const command = client.commands.get(interaction.commandName);

    if (!command) {return;}

    if (!await interaction.deferReply({ ephemeral: true })
            .then(() => {
                logger.info(`/${interaction.commandName} command deferred`);
                return true;
            }).catch((error) => {
                logger.warn(`/${interaction.commandName} could not be deferred (${error})`);
                return false;
            })
    ) {
        return;
    }

    await command.execute(interaction)
        .then((res) => {
            logger.info(`${interaction.commandName} command execution completed with status ${res}`)
        }).catch(async (error) => {
            await interaction.followUp({content: 'There was an error D:', ephemeral: true})
                .then(() => {
                    logger.warn(`${interaction.commandName} command executed with error. Application successfully sent error message`)
                }).catch(() => {
                    logger.error(`${interaction.commandName} command was unable to be executed. Application did not respond in time: ${error}`);
                    return false;
                });
        });
    
});

client.login(process.env.DISCORD_TOKEN);

process.on('beforeExit', () => {
    minecraftTracker.stop();
    process.exit(0)
});
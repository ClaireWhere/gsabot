'use strict';
const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { config } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });


// Initialize Events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


// Initialize Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    try {
        client.commands.set(command.data.name, command);
        console.log(`initialized command ${command.data.name}`);
    } catch (error) {
        console.error(`ERROR: could not load command from file ${file} (${error})`);
    }
}

// Command handler
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    await command.execute(interaction)
        .then((res) => {
            if (config.debug_mode) {
                console.debug(`command execution completed with status ${res}`);
            }
        }).catch(async (error) => {
            await interaction.followUp({content: 'There was an error D:', ephemeral: true})
                .then((res) => {
                    if (config.debug_mode) {
                        console.debug(`command executed with error. Application sent error message`);
                    }
                }).catch((err) => {
                    console.error("command was unable to be executed. Application did not respond in time");
                    return false;
                });
        });
    
});

client.login(process.env.DISCORD_TOKEN);
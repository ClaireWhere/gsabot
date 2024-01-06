# gsabot

Discord bot for the Gender and Sexuality Alliance.

> [!IMPORTANT]
>
> To see a full list of features, see [List of all Features](FEATURES.md)
>
> Use [this link](https://github.com/ClaireWhere/gsabot/blob/main/FEATURES.md) if the first one is broken (GitHub struggles with relative links on the main page)

## Installation

1. Ensure all [dependencies](README.md#dependencies) are configured and running
2. Clone the repository
    - If installing from github, use

    ```sh
    git clone https://github.com/ClaireWhere/gsabot.git
    ```

3. Configure the [Environmental Variables](README.md#environmental-variables)
4. Setup `config.json` to your configuration
    - See [Config](README.md#config) for more information
5. Run `npm install` to install all dependencies
6. Run `npm run reset` to delete and re-deploy any commands to the Discord bot. This only needs to be run whenever new commands are added or removed.

## Dependencies

- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (v8.1.0 or higher)
    Ensure it is properly installed and working with `npm -v`
- [node.js](https://nodejs.org/en/) (v20.10.0 or higher)
    Ensure it is properly installed and working with `node -v`
- A Discord bot application
  - Detailed [instructions](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
    - Ensure the bot is added to the server specified in the `GUILD_ID` environmental variable

> [!NOTE]
>
> The following dependencies are only required for the `deleted message` features (see [FEATURES](FEATURES.md#deleted-message-logger)). If these features are not being utilized, disable them in [client/config.json](client/config.json). If they are being utilized, ensure the following dependencies are installed and configured properly.

- [sqlite3](https://www.sqlite.org/download.html) (v5.0.2 or higher)
  - This application uses a local SQLite deployment.
  - Detailed [Installation instructions](https://www.sqlitetutorial.net/download-install-sqlite/)
  - Ensure it is properly installed and working with `sqlite3 --version`

- A publicly routable IP address
  - `server.js` is configured to run on the local port specified in the `APP_PORT` environmental variable and assumes subdomain.domain specified in `SERVER_SUBDOMAIN` and `DOMAIN` environmental variables routes to the network the application is running on and to that port locally.
  - Since this is a local port, there must be a way for the router to route traffic to the specific port on the network the application is running.
  - One easy way to do this without exposing the network IP is to setup a [Cloudflare Access Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/). More information can be found at <https://www.cloudflare.com/>

> [!NOTE]
>
> (Optional) To use the latest release/update from github, the following dependencies are required

- [git](https://git-scm.com/) (v2.41.0 or higher)
  - Ensure it is properly installed and working with `git --version`

## Run the application

### Run with Docker

1. Navigate to the project directory

    ```sh
    cd gsabot
    ```

2. Build the Docker image

    ```sh
    sudo docker build . -t gsabot
    ```

3. Run the Docker image

    ```sh
    sudo docker run -d --name gsabot -p 192.168.1.{ip}:{port}:{port} gsabot
    ```

### Run without Docker

1. Install NPM packages

    ```sh
    npm install
    ```

2. Start the bot

    ```sh
    npm start
    ```

## Config

To be added

- [client/config.json](client/config.json)
- [config.json](config.json)

## Environmental Variables

Ensure all environmental variables are spelled exactly as below and can be found in `.env` in the `root` ([.env](.env)) and `/client` ([client/.env](client/.env)) directory before running the application.

### Root

- `APP_PORT` - the local port the server application should be running on
- `DOMAIN` - the domain name of the application
  - does not include any subdomains (www)
- `SERVER_SUBDOMAIN` - the subdomain used for the server application

### Client

- `CLIENT_ID` - the Client ID of the Discord bot application
- `GUILD_ID` - the ID of the Discord server the bot should be in
- `DISCORD_TOKEN` - the token secret for the Discord bot application
- `SCHOOL` - the name of the school this bot is for, formatted for display
- `SCHOOL_CODE` - the abbreviation of the school this bot is for
- `REGISTER` - the name of the registration service for the bot
  - as in, "go to REGISTER to register for this organization"
- `GSA_BANNER` - the banner image
  - Since the `gsa banner` image may contain sensitive information about the name of the school, it is contained in [client/.env](client/.env). All other images are in [client/config.json](client/config.json) since they shouldn't contain any sensitive information.
- `DOMAIN` - the domain name of the application
  - does not include any subdomains (www)
- `MINECRAFT_SUBDOMAIN` - the subdomain used to connect to the Minecraft server

## Additional setup, maintenance, and configuration information

Button id's follow the format: `category`:`subcategory`:`id`

> [!NOTE]
>
> `id` is always the last element of the group and is the most specific descriptor of the purpose of the button. `category` and `subcategory` are both optional to add additional description to the purpose. This is especially helpful if there are many buttons that require similar response actions that can be filtered out with a single `category` descriptor. `subcategory` can similarly offer a second level of description. There is technically no limit to how many subcategories there are, but it is recommended to try to keep them as concise as possible while offering a balance between readable simplicity and code efficiency.

### Current Button categories

- `role` - specifies a role that should be applied or removed from the source user
  - `{id}` - the id of a role that has no subcategory
  - `pronouns`
    - `{id}`
  - `identity`
    - `{id}`
  - `year`
    - `{id}`
- `color`
  - `no` - indicates the color interaction should be canceled
  - `{hex}` - the hex code representing a color. Should have the format xxxxxx, where x is [0-9] or [a-f] all lowercase
- `{id}` - the id of a specific action with no other similar buttons

> [!NOTE]
>
> To add a new reaction role, simply specify its information in [client/config.json](client/config.json) in the `roles` section. When a button is pressed with the same id as the `id` property specified, that role will be handled by the bot. No other configuration is necessary. Just ensure the information in [client/config.json](client/config.json) lines up with the roles in the Discord server.

Adding new functionality must be specified in [buttonEvent.js](client/events/buttonEvent.js)

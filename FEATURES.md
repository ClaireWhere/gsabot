# GSA Bot - List of all Features

## Commands

<details>
<summary>Click to expand commands list</summary>

### /color

**`set [hex]` subcommand**

Sets the users role color to the specified hex
- Hex must be in the form #XXXXXX, using only characters [0-9, a-f]
    - the # is optional
    - characters may be uppercase or lowercase
- If the user does not have a color role, a new one is created and positioned so that it displays as the user color
- Color roles are named in the format "`name`'s Color", where name is the users server nickname if one exists, global display name otherwise if one exists, or username if the user has neither a server nickname or display name.
    - Whenever a user runs /color set, the name of their color role is updated to use their most current nickname

**`view` subcommand**

Displays the user's current role color and hex, if one exists. If the user does not have a role color, they will be prompted to set it with /color set. 

**`remove` subcommand**

Removes and deletes the user's current role color, if one exists. If the user does not have a role color, they will be prompted to set it with /color set. A new color can be set at any time with /color set.

### /repair
Creates and repairs important server resources

**`roles` subcommand**
- creates and repairs server roles
- role data specified in config
- Roles included:       
    > `GSA President`, `GSA Technology Manager`, `GSA Vice President`, `GSA Treasurer`, `GSA Secretary`, `Eboard`, `GSA Member`, `She/Her`, `She/They`, `She/He`, `She/He/They`, `She/They/He`, `He/Him`, `He/They`, `He/She`, `He/She/They`, `He/They/She`, `They/Them`, `They/She`, `They/He`, `They/She/He`, `They/He/She`, `Any Pronouns`, `Neopronouns`, `Straight`, `Questioning`, `Queer`, `Lesbian`, `Gay`, `Bisexual`, `Pansexual`, `Asexual`, `Aromantic`, `Year 1`, `Year 2`, `Year 3`, `Year 4+`, `Alumni`, `Graduate Student`, `Announcements`, `Safe Space`, `Politics`, `Minecraft` 

### /send
Sends embed-formatted informational/functional server messages

**`agreement [channel]` subcommand**
- Sends the server agreement messages in the specified channel

**`roles [channel]` subcommand**
- Sends the user role messages in the specified channel

**`rules [channel]` subcommand**
- Sends the rules message in the specified channel

**`welcome [channel]` subcommand**
- Sends the initial server welcome message in the specified channel

**`politics [channel]` subcommand**
- Sends the politics rules/agreement messages in the specified channel

**`safe_space [channel]` subcommand**
- Sends the safe space rules/agreement messages in the specified channel

**`vc [channel]` subcommand**
- Sends the vc instruction information in the specified channel

</details>

---

## New Member Rules Agreement
When a new user joins the Discord server, they should have access to only two channels: The "welcome" channel, and the "agreement" channel. The welcome channel directs users to the agreement channel where they must press a button after reading the rules to agree to the rules of the server. Upon agreeing to the rules by interacting with the button, the `GSA Member` role is assigned to the user, giving access to the general server channels.

## New Member Welcome Message
Whenever a new member passes the verification, a message is sent in the `#welcome` channel welcoming them to the server. The color of the embed is randomly chosen from a set of rainbow colors (specified in `config.js`)

## Safe Space Agreement
the `#safe-space` channel is not accessible to members unless they have the `Safe Space` role. However, the `#safe-space-agreement` is accessible to all members, and lays out the rules of `#safe-space`. A member may opt-in to `#safe-space` by agreeing to the rules, which will assign the `Safe Space` role and allow access. The `Safe Space` role may be removed at any time by clicking on the agreement button a second time and access to `#safe-space` will be revoked.
## Deleted Message Logger
When a message is deleted, information about the message is logged in the system message channel. This information includes the author, channel, created timestamp, and ids. The message content is also preserved in a format similar to the original Discord message. 

## Deleted Message Retrieval
Deleted messages are stored in a local database for retrieval at a later date. In each deleted message log, a link to the raw content is included. Upon following this link, a page with the raw text is displayed. This requires server.js to be online.

## Minecraft Server Tracker
Pings the Minecraft server every minute to check the player count. If the player count changes, the server can no longer be reached, or the service pinging the server cannot be reached, the status is logged.
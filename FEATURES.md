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

## Custom Neopronoun Role Manager
Clicking the `Manage Neopronouns` button in the role selection channel opens a modal where users can input their own neopronouns

<p align="center" width="100%">
    <img src="https://i.imgur.com/FN2P0hF.png">
    <img src="https://i.imgur.com/01z8Vry.png">
</p>

> ⚠️ Important: 
>- Neopronoun roles must contain at least one "/" character
>   - otherwise it will be rejected
>- Neopronoun roles may have a maximum length of 40 characters
>   - otherwise it will be rejected
>- Multiple neopronoun roles must be separated by a comma AND a space
>   - otherwise the application will consider it one neopronoun

> 📝 Note:
>- Capitalization does not matter for neopronoun input
>   - it will be handled by the application
>- There is no limit to how many "/" characters are included in a neopronoun, as long as it fits within the 40 character limit
>- The 40 character limit is due to discord chopping off anything longer for display purposes
>   - here's what a 32 character long neopronoun might look like: phey/phem/pheir/pheirs/pheirself
>   - if you need longer a neopronoun role, you may have to split it into 2 roles
>- You may specify as many neopronouns as can fit in the 200 character limit in any single interaction
>   - if you need more space, press the button again


Upon clicking submit, the roles will be assigned to the user, creating new roles if necessary. A message should be sent confirming that the roles have been assigned as well as the `Neopronouns` role that specifies the user uses neopronouns.

<p align="center" width="100%">
    <img width="50%" src="https://i.imgur.com/zAf2bA0.png">
</p>

Roles may be added, changed, or removed by clicking the `Manage Neopronouns` button another time. A modal is opened displaying the user's existing neopronouns above the top input, which is used to specify neopronouns for removal. The second input can be used the same as before to specify new neopronouns. Neopronouns may be added only, removed only, or added and removed at the same time with this interaction.

> ⚠️ Important: Neopronouns must be spelled exactly the same as they are spelled above the input (capitalization does not matter) or their roles won't be removed.

> 🚫 Display Issues: The neopronouns specified above the removal input are cut off after 45 characters. This is a Discord limitation, and there is no other location to display text. Once Selection Menus are implemented by Discord this should be much cleaner. If some neopronoun roles are not displayed, they can still be typed in the input and removed properly, it is a purely visual issue.

> 📝 Note: The "Neopronouns" role is automatically given in every "Manage Neopronouns" interaction unless specified to be removed. If you would like to prevent receiving this role when adding new neopronouns, make sure to type "neopronouns" into the removal input to stop it from being added.

<p align="center" width="100%">
    <img src="https://i.imgur.com/fEhPHxX.png">
    <img src="https://i.imgur.com/FCrCnkF.png">
</p>

Upon clicking submit, any neopronouns specified for removal will be removed, and any neopronouns specified for addition will be added. A message should be sent confirming any removed or added roles.

<p align="center" width="100%">
    <img width="40%" src="https://i.imgur.com/IBXshfu.png">
    <img width="30%" src="https://i.imgur.com/1KMfFaH.png">
</p>

---

## New Member Rules Agreement
When a new user joins the Discord server, they should have access to only two channels: The "welcome" channel, and the "agreement" channel. The welcome channel directs users to the agreement channel where they must press a button after reading the rules to agree to the rules of the server. Upon agreeing to the rules by interacting with the button, the `GSA Member` role is assigned to the user, giving access to the general server channels.

## New Member Welcome Message
Whenever a new member passes the verification, a message is sent in the `#welcome` channel welcoming them to the server. The color of the embed is randomly chosen from a set of rainbow colors (specified in `config.js`)

## Safe Space Agreement
the `#safe-space` channel is not accessible to members unless they have the `Safe Space` role. However, the `#safe-space-agreement` is accessible to all members, and lays out the rules of `#safe-space`. A member may opt-in to `#safe-space` by agreeing to the rules, which will assign the `Safe Space` role and allow access. The `Safe Space` role may be removed at any time by clicking on the agreement button a second time and access to `#safe-space` will be revoked.

## Politics Agreement
the `#politics` channel is not accessible to members unless they have the `Politics` role. However, the `#politics-agreement` is accessible to all members, and lays out the rules of `#politics`. A member may opt-in to `#politics` by agreeing to the rules, which will assign the `Politics` role and allow access. The `Politics` role may be removed at any time by clicking on the agreement button a second time and access to `#politics` will be revoked.

## Role Compatibility
Certain roles are not able to be assigned at the same time. The rules for the compatibility of roles are defined in `config.js` and are summarized here:

<details>
<summary>Role Compatibility Rules</summary>


The following categories are used in the rules below to make the role compatibility easier to follow

1. **Globally Compatible**: 
    > - Each role listed is compatible with all other roles with no restrictions
2. **Mutually Compatible**: 
    > - Each role listed is compatible with any of the other roles in the same row, and each of those roles is compatible with the leftmost role
    > - A user may have the leftmost role and any one of the other roles in the same row at the same time
3. **Mutually Incompatible**: 
    > - Each role listed is explicitly incompatible with any of the roles in the same row, and each of those roles are explicitly incompatible with the leftmost role. 
    > - A user is not allowed to have the leftmost role and any one of the other roles in the same row at the same time
4. **Globally Incompatible**: 
    > - Each role listed is incompatible with all other roles in the same category (other than globally compatible roles)
    > - Any given user is only allowed to have one of these roles at any given time


<details>
<summary>Pronoun Roles</summary>

---

| **Globally<br/>Compatible** | │ | **Mutually<br/>Compatible** |     |          |     |            | │ | **Globally Incompatible** |
| :-------------------------: |:-:| :-------------------------: | :-: | :------: | :-: | :--------: |:-:| :-----------------------: |
| Neopronouns                 | │ | She/Her                     | <=> | He/Him   | <=> |  They/Them | │ | She/He/They               |
|                             | │ | She/They                    | <=> | He/They  |     |            | │ | She/They/He               |
|                             | │ | She/They                    | <=> | She/He   |     |            | │ | He/She/They               |
|                             | │ | They/She                    | <=> | He/She   |     |            | │ | He/They/She               |
|                             | │ | They/He                     | <=> | She/He   |     |            | │ | They/She/He               |
|                             | │ | They/He                     | <=> | They/She |     |            | │ | They/He/She               |
|                             |   |                             |     |          |     |            |   | Any Pronouns              |

</details>

<details>
<summary>Year Roles</summary>

---

|  **Globally Incompatible**  |
| :-------------------------: |
| Year 1                      |
| Year 2                      |
| Year 3                      |
| Year 4+                     |
| Alumni                      |
| Grad Student                |

</details>

<details>
<summary>Identity Roles</summary>

---

| **Globally Compatible** | │ | **Mutually<br/>Incompatible** |       |           |     |          |           |
| :---------------------: |:-:| :---------------------------: | :---: | :-------: | :-: | :------: | :-------: |
| Queer                   | │ | Straight                      | <=/=> | Lesbian   | Gay | Bisexual | Pansexual |
| Questioning             | │ | Bisexual                      | <=/=> | Pansexual |
| Asexual                 |
| Aromantic               |

</details>

</details>

## Deleted Message Logger
When a message is deleted, information about the message is logged in the system message channel. This information includes the author, channel, created timestamp, and ids. The message content is also preserved in a format similar to the original Discord message. 

## Deleted Message Retrieval
Deleted messages are stored in a local database for retrieval at a later date. In each deleted message log, a link to the raw content is included. Upon following this link, a page with the raw text is displayed. This requires server.js to be online.

## Minecraft Server Tracker
Pings the Minecraft server on a schedule to check the player count. If the player count changes, the server can no longer be reached, or the service pinging the server cannot be reached, the status is logged.
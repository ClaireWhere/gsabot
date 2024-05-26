# GSA Bot - Change Log

## GSA Bot Version 0.2.0 (Not Released Yet)

This release separated the bot into three separate modules: The GSA Discord Bot, the GSA Server, and the GSA Database. The GSA Discord Bot (referred to as simply GSA Bot) is the Discord bot that interacts with the Discord API and the GSA Server is the server that accesses.

### Major Feature Changes

---

### Minor Feature Changes

---

### Bug Fixes

---

## Version 0.1.4 (2023-10-17)

### Major Feature Changes
---
+ Added GSC Roles
    - GSC Coordinator
    - GSC Graduate Assistant
    - GSC Student Assistant
+ Added GSC Announcement Role
    - Added to role selection
+ Add Ticket Handling System
    + Button -> Modal -> Submission
+ Added GSC Announcement Ticket
    - Only accessible by GSC Coordinator, GSC Graduate Assistant, and GSC Student Assistant
    - Submission sends announcement message
    - Input to specify announcement message (required)
    - Option to ping GSC Announcements

## Minor Feature Changes
---
+ Exclude 's' for 1 player online, otherwise x players online
+ Changed default Minecraft Tracker frequency from every 5 minutes to every 2 minutes
+ Handled command error responses universally, rather than individually
+ Deleted Message Logger now uses locale date and time strings everywhere
+ Fixed up some wording on role messages
+ Role messages now use rainbow colors from config
+ Rearranged role choices for `/edit roles` to the order they are sent by `/send roles`

### Bug Fixes
---
+ Fixed Minecraft Tracker scheduling
+ Fixed bot always executing interactions regardless of whether they had already been deferred
+ Fixed double logging occasionally crashing bot
    - Now uses variables instead of objects to avoid invalid keys
+ Fixed timestamps in Deleted Message Logger
    - Message image timestamp now shows creation date
    - Now keeps consistent date usage (doesn't create new dates)
+ Fixed `/repair roles` crashing whenever roles need permission changes
+ Fixed searching for database in the wrong location

## Version 0.1.3 (2023-09-10)

### Big Fixes
+ Added missing filter in safe space entrance message
+ Removed space from politics entrance message

## Version 0.1.2 (2023-09-10)

### Major Feature Changes
---
+ Added **Winston Logger**
    + Massively improved logging detail
+ Added **Online Player Display** for the Minecraft Server
+ Added **Custom Bot Status**


### Minor Feature Changes
---
+ Organized a lot of utilities
+ Added a bunch of docstring
+ Improved consistency of `/color` position assignment
+ Now stores author's nickname instead of username in Deleted Message Logger database
+ Added a single space in a single message somewhere :)

### Bug Fixes
---
+ Fixed incorrect role positioning in `/repair roles`
+ Fixed inclusivity of neopronoun roles including all pronoun roles if they are found below the Neopronouns role
+ Added filters when linking channels in messages
    + Welcome message now always shows the correct `#roles` channel
    + All messages sent with `/send` and `/edit` now include the correct channels and the channel name only where applicable
+ Fixed undefined username on Deleted Message Logger
+ Use author avatar image for Deleted Message Logger
+ Fixed Deleted Message Logger crashing on invalid attachment
+ `delete-commands.js` actually works now
+ Added handling for many errors

### Removed
---
+ Implementation of debugger

## Version 0.1.1 (2023-08-31)

### Major Feature Changes
---
+ Added **Custom Neopronoun Role Manager**
    + Changed "Request Neopronouns Role" button to "Manage Neopronouns"
+ Added fallbacks for application taking too long to respond
    + Protects against Discord API latency issues
+ Changed database system to SQLite
    + Added table initialization
+ Added **/edit** [subcommand] ([type]) [channel] [message_id]
    + agreement
    + politics
    + roles
        + [type]: Announcements, Identity, Minecraft, Pronouns, Year
    + rules
    + safe_space
    + vc
        + [type]: Info, Mobile, PC
    + welcome

### Minor Feature Changes
---
+ Added custom bot status
    + Added custom bot status configuration
+ Changed internal name of Minecraft Server Tracker
+ Improved Minecraft Server Tracker error message
+ Added tests for Minecraft Server Tracker
+ Added configuration for Minecraft Server Tracker
    + Enable/disable
    + Configurable frequency
+ Reformatted LoggedMessage 
    + Improved the order fields show up
    + Improved the detail of field names
    + Now includes deleted_on field
+ Deleted message timestamps are now stored
+ Added configuration for Deleted Message Logger
    + Enable/disable
    + Enable/disable database storage
+ Added npm initialization for database
+ Added root config
    + For "global" configuration that applies the entire application
+ Added **debug mode** and configuration
+ Various performance improvements
+ Added internal utilities
+ Organized internal files and functions
+ Improved code readability and organization
+ Improved file and function names for clarity

### Bug Fixes
---
* Added validity checks to commands
* Fixed Minecraft Server Tracker status logger logging the same error status multiple times in a row
* Fixed Deleted Message Logger to use the correct root .env configuration instead of client .env
* Fixed some role exclusivity rules configured to include themselves
* Fixed some role exclusivity rules configured to include roles that should not be included
* Fixed some role exclusivity rules that weren't even configured
* Application no longer tries to respond to Message Delete events
+ Added fallback fonts for Deleted Message Logger to avoid missing font issues

### Removed
---
- Removed MongoDB usage

---

## Version 0.1.0 (2023-08-14)

### Major Feature Changes
---
**Commands**
+ Added **/color** 
    + set 
        + *[hex]*
    + view
    + remove
+ Added **/repair**
    + roles
+ Added **/send**
    + agreement 
        + *[channel]*
    + roles 
        + *[channel]*
    + rules 
        + *[channel]*
    + welcome 
        + *[channel]*
    + politics 
        + *[channel]*
    + safe_space 
        + *[channel]*
    + vc 
        + *[channel]*
+ Added **new member welcome agreement**
+ Added **new member welcome message**
+ Added **safe space agreement**
+ Added **politics agreement**
+ Added **role compatibility rules**
+ Added **deleted message logger**
+ Added **dynamic deleted message display**
+ Added **deleted message retrieval**
+ Added **color role handling**
+ Added a defined **role heirarchy**
+ Added **Minecraft server tracking**

### Minor Feature Changes
---
+ Alt text for images should actually exist now
+ Formatted a lot of text to use headers
    + VC Text


### Bug Fixes
---
- None

### Removed
---
- None
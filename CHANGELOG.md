# GSA Bot - Change Log

## Version 0.1.1 (Not released yet)

### Major Feature Changes
---
+ Added Custom Neopronoun Role Manager
+ Added fallbacks for application taking too long to respond
    + Protects against Discord API latency issues
+ Changed database system to SQLite
    + Added table initialization

### Minor Feature Changes
---
+ Added custom bot status
    + Added custom bot status configuration
+ Added configuration for Minecraft Server Tracker
    + Enable/disable
    + Configurable frequency
+ Added configuration for Deleted Message Logger
    + Enable/disable
    + Enable/disable database storage
+ Improved Minecraft Server Tracker error message
+ Added debug mode and configuration
+ Added internal utilities
+ Changed internal name of Minecraft Server Tracker
+ Organized internal files and functions
+ Improved code readability and organization
+ Added tests for Minecraft Server Tracker
+ Added root config
    + For "global" configuration that applies the entire application
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
- None

### Bug Fixes
---
- None

### Removed
---
- None
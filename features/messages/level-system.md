---
description: Use messages as an activity meter
---

# Level system

With the level system you can measure user activity and see how active your server is.

You can also give users roles as a reward for reaching a specific level.

{% hint style="danger" %}
Role delivery by level only works if the bot is given the`MANAGE_ROLES` permission
{% endhint %}

{% hint style="warning" %}
To modify the system, you will need the `ADMINISTRATOR` permission
{% endhint %}

### Enabling

{% hint style="success" %}
The same options are available on the dashboard in the Level system section: [https://gidget.xyz/dashboard](https://gidget.xyz/dashboard).
{% endhint %}

By default, this feature is disabled in its entirety.

Use the command `g%togglelevel` with `system` as an argument.

When activated, the bot will capture the messages from that moment to compensate them as server activity.

{% hint style="info" %}
Do you want the bot to notify in the chat when a user has leveled up? Use the same command but with the `notif` argument.
{% endhint %}

### Role delivery by level

For this function the `g%setlevelroles` command is used

Use the `add` argument when you want to add a level where the user will be given X roles

```text
g%setlevelroles add <level> <valid roles>
g%setlevelroles add 6 669767097512886285
```

If you no longer want the bot to give those roles when that level is reached use the `remove` argument

```text
g%setlevelroles remove <level>
g%setlevelroles remove 6
```

### Modify a user's level

For that the `g%modifylevel` command is used

```text
g%modifylevel <userID> <option> <amount/level>
```

The available options are:

* subtract \(xp\)
* subtractlevel
* setlevel
* appendlevel
* appendxp
* setxp

There is also the `delete` argument

```text
g%modifylevel <userID> delete
g%modifylevel 577000793094488085 delete
```

This argument removes the level that this user had on the server, resetting his total XP to 0.


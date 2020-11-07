---
description: Roles that specify something about the user? You can do it with this bot.
---

# Reaction-roles

Basically reaction-roles are to deliver roles when a user reacts with an emoji to a specific message.

{% hint style="warning" %}
You will need the `ADMINISTRATOR` permission to modify this.

The bot needs the `MANAGE_ROLES` permission.
{% endhint %}

### Adding messages

To add new reaction-roles the `g%addrr` command is used.

```text
g%addrr <messageID>
g%addrr 766718591713673266
```

The command will use a collector to ask you the emojis + roles that you will configure.

When asked, you should put your settings like this:

```text
<emoji>, <role>
WubbzyWalk, Birdy Bird
```

When you do, the bot will react with the emoji you specified. To save the changes put `?done`

Once that is done, the bot will now be listening to the message, and giving the corresponding roles.


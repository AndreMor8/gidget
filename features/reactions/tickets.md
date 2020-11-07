---
description: Improve the support you give your users on your server.
---

# Tickets

The logic of which this system is built is as follows.

The bot, once the ticket is created, will create a message with the subject of the specified message, and reacting with the emoji that was set. The user must react with said emoji, so that a specific ticket is opened to the user. Once the `user => staff` contact is finished, the staff can close the ticket, and if the configuration allows it, then the user can do it. In case the staff does, they can put a reason to the command so that the user knows why their ticket was closed.

With this you can create a support system for your server.

{% hint style="warning" %}
You will need the `ADMINISTRATOR` permission to modify this.

The bot needs the `MANAGE_CHANNELS` permission.
{% endhint %}

### Enabling

Something that allows this functionality in general is to have several ticket systems.

To create one, use the `g%startticket` command

```text
g%startticket <channel> <category-for-tickets> <emoji> <title-for-ticket>
```

If you forget the arguments, don't worry, the bot will remind you one by one.

### Modifing

Use the `g%modifyticket` command

```text
g%modifyticket <message> [<mode> [...args]]
```

The way to recognize one system with another is with the IDs of each message created. When only the message ID is entered, the current settings will be displayed along with the available modes to configure.

### Deleting

Use the `g%finishticket` command

```text
g%finishticket <message>
```

Once the message ID is set, the bot will remove any reference to the ticket system from the database.

### Closing a individual ticket

{% hint style="info" %}
For the user who created the ticket to be able to close it, the ticket system must have manual closing activated.

`g%modifyticket <message> manual`
{% endhint %}

Use the `g%closeticket` command

```text
g%closeticket [reason]
```

Once that is done, the ticket channel will be deleted. If the staff closes the ticket, the user will be notified who closed it, and if they did, the reason.

Obviously this doesn't work with normal channels.


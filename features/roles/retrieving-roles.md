---
description: 'User returning to the server: Where are my roles?'
---

# Retrieving roles

{% hint style="danger" %}
Since the bot does not have the Presence Intent, AndreMor plans to remove this feature.

Roles will only be retrieved to users who, before leaving the server, have been in the bot's cache. \(they do an action in front of the bot or are connected to a voice channel\)
{% endhint %}

{% hint style="warning" %}
You need the `ADMINISTRATOR` permission to activate this.

The bot needs the `MANAGE_ROLES` permission.
{% endhint %}

### Enabling

Use the `g%toggleretrieving` command

When activated, the bot will save the users that leave the server, in its database, with the roles that the bot can deliver.

When the user returns, the database will be searched for whether the user has previous roles. If so, those roles will be retrived.

{% hint style="info" %}
The bot did not retrive certain roles? Make sure the highest role the bot has, is higher than the role you want to try to retrive.
{% endhint %}

### Removing a user from the database

To remove a user, that way, their previous roles are not retrieved, use the `g%mlremove` command.

```text
g%mlremove <userID>
g%mlremove 577000793094488085
```


---
description: Mention messages with the bot
---

# Message links

{% hint style="warning" %}
You will need the `ADMINISTRATOR` permission to activate this
{% endhint %}

This function is activated with the `g%togglemessagelinks` command

When activated, Gidget will detect all messages where it can read, and if it detects a message link like this:

```
https://discord.com/channels/<guildID>/<channelID>/<messageID>
```

Then Gidget will "mention" that message, so you don't need to click to read it

{% hint style="info" %}
Gidget will not mention (show) messages where the mentioner does not have permissions.

The same if the bot does not have permissions to read in the channel specified by the link.
{% endhint %}

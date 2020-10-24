---
description: A text channel only for those who are connected to that voice channel.
---

# Voice-role

Have the bot deliver a role to users who are connected to a voice channel.

This makes it possible to control access to other parts of the server when connected to a voice channel.

{% hint style="warning" %}
You need the `ADMINISTRATOR` permission to activate this.

The bot needs the `MANAGE_ROLES` permission.
{% endhint %}

### Configuring

This feature is configured with the `g%voicerole` command

Enable it this way:

```text
g%voicerole enable
```

The logic of the feature is `role => channels`

Add a role to deliver on X channels:

```text
g%voicerole add <role> <channel(s)>
g%voicerole add 747319568355164242 747326050387886171 747318743994204175
```

Delete it to no longer deliver that role:

```text
g%voicerole remove <role>
g%voicerole remove 747319568355164242
```

Modify an existing role. This is a `set` subcommand, you must set the previous channels if you want the role to still be delivered on those channels.

```text
g%voicerole edit <role> <channel(s)>
```

{% hint style="info" %}
Make sure the roles you put here are lower than the highest role the bot has.
{% endhint %}




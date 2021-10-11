---
description: There are many messages. Can I at least automate the cleaning?
---

# Bulk delete

Discord can clean messages in bulk, its endpoint is bulkDelete, although users cannot use it.

In Gidget we offer the `purge` command to mass delete messages, and not only that, as we know it is possible to select which messages to delete, well, we can clean messages with certain characteristics :)

```
g%purge [mode] <limit> [<args>]
```

Let's see the available modes.

{% hint style="warning" %}
Both the bot and the user need the `MANAGE_MESSAGES` permission on the channel to mass delete messages.
{% endhint %}

{% hint style="info" %}
Note that `<number>` will be the number of messages to collect, and then filter it, which will obviously be fewer messages than what is set in `<number>`.
{% endhint %}

### Delete by author

The structure would be like this:

```
g%purge users <number> <users...>
g%purge users 100 577000793094488085 224619540263337984 756733721171984444
```

This will query the last X messages and will delete those that have the author IDs that you have set.

### Delete bot messages

```
g%purge bots <number>
```

### Delete messages with files

```
g%purge attachments <number>
```

### Delete messages with embeds

```
g%purge embeds <number>
```

### Delete messages with certain content

{% hint style="info" %}
This internally makes a `new RegExp()` to the sentence.

With that you can take advantage of putting regex characters to improve precision when detecting.
{% endhint %}

```
g%purge with <number> <sentence>
g%purge with 100 this is awful
```

### Default mode

```
g%purge <number>
```

It's not complicated at all :)

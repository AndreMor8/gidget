---
description: Respond to things the user says automatically
---

# Custom responses

As its name says, you can make the bot reply with a message if the content of a user's message matches the word or sentence you have entered.

{% hint style="info" %}
This internally makes a `new RegExp()` to the sentence.

With that you can take advantage of putting regex characters to improve precision when detecting.
{% endhint %}

{% hint style="warning" %}
You will need the `ADMINISTRATOR` permission to activate/modify this
{% endhint %}

{% hint style="success" %}
The same options are available on the dashboard in the Custom responses section: [https://gidget.andremor.dev/dashboard](https://gidget.andremor.dev/dashboard).
{% endhint %}

### Enabling

#### Adding

Custom responses are enabled by default, just without any responses to answer.

To add a new custom response, use the `g%addcc` command

```
g%addcc <match> | <response>
g%addcc How are you? | Good
```

#### Listing

Use the `g%listcc` command to get the responses configured on the server

#### Deleting

Just use the `g%delcc` command with the respective ID

```
g%delcc <id>
g%delcc 4
```

You can get the ID with the `g%listcc` command, mentioned above.

{% hint style="info" %}
Why `cc`? Well, AndreMor doesn't know why.
{% endhint %}

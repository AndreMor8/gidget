---
description: >-
  It is polite to say hello. Discord already does it for you, but maybe you want
  more than that.
---

# Welcome system

 With Gidget, you can activate a simple welcome and goodbye system on your server, with very easy to use variables. Let's see how we can configure this.

{% hint style="warning" %}
You will need the `ADMINISTRATOR` permission to activate this
{% endhint %}

### Variables

{% hint style="danger" %}
In order for the bot to detect invitations, it needs the `MANAGE_GUILD` permission.
{% endhint %}

```
%MEMBER% -> New member mention. The client may or may not cache the user, so don't report things like @invalid-user
%MEMBERTAG% -> New member tag (AndreMor#0008). May not work on goodbyes.
%MEMBERID% -> New member ID.

%SERVER% -> Server/guild name.
%MEMBERCOUNT% -> How many members does the server have according to the API.

//Only welcome
//It should be easy for the bot to detect the invitation.
%INVITER% -> Inviter mention. Same notice as member variable.
%INVITERTAG% -> Inviter tag (AndreMor#0008).
%INVITERID% -> Inviter ID.
```

### Enabling

{% hint style="success" %}
The same options are available on the dashboard in the Welcome section: [https://gidget.andremor.dev/dashboard](https://gidget.andremor.dev/dashboard).
{% endhint %}

To enable it, you will first need to configure certain things, such as the welcome channel, and the welcome message.

To set a welcome channel, we will use the following command:

```
g%configwelcome channel <channel>
g%configwelcome channel 747329582352433246
```

Now we will set the message:

```
g%configwelcome message <text>
g%configwelcome message hola!
```

Set it up with the variables written above.

Finally, to enable it, use:

```
g%configwelcome enable
```

And voila, Gidget will notify each new member that enters your server.

Do the same for the other sections when you put only the command:

```
g%configwelcome
```


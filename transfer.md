The [original site](https://nuzlocke.app/) is still down currently. To transfer
saves from the original site to this fork, follow these instructions:

1. Download the script. It's well-documented if you want to understand it.
   I know taking a script from the internet isn't usually safe, so I encourage
   you to ask around, get other eyes on it to make sure this does what the
   comments say it does. Remain vigilant.
2. Open the Original Nuzlocke Site
3. Right-click the page
   (I'm trying to get you to open Dev Tools, for the tech-savvy people)
4. Click "Inspect"
5. On the window/panel that appears, select the "Console" tab
6. Copy/paste the script into the console and submit it
7. This should download the `.nzsav` files that you would otherwise get from
   the download/share workflow on the original site
8. Open the New Nuzlocke Site
9. Click "Load Game" and scroll to the bottom of the screen
10. Upload the `.nzsav` files

```js
// We track the number of saves we've iterated through, explained at the "setTimeout line"
i = 0;

// The list of your saves is in this "localStorage" object, but I only grab the high-level information about the saves themselves
localStorage['nuzlocke.saves']
    // Each entry is comma separated    
    .split(',')
    .forEach(key => {
        // These entries are your save's meta data. What game is it, what did you title it, what attempt number, etc. Extract them for later
        var [guid, range, name, game, settings, attempts] = key.split('|');
        var [start, end] = range.split('>');
        name = name.replaceAll("%20", " ");

        // Like the list of saves, each save is stored in "localStorage." We retrieve them one at a time
        var gameData = JSON.parse(localStorage['nuzlocke.' + guid]);

        // Format the data from lines 10 and 11 in a way that the website can read it on upload. Add it to the game data itself
        gameData["__meta"] = {
            name: name,
            attempts: attempts,
            game: game,
            id: guid,
            settings: settings,
            created: start,
            updated: end
        };

        // Add a 200ms delay between downloading files to bypass browsers' limits of 10 file batches. This is why we need the "i" variable
        setTimeout(() => {
            // Convert the save to regular text, create a button on the screen, and press it to download it
            var text = JSON.stringify(gameData);
            var blob = new Blob([text], { type: 'text/plain' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = name + " - " + game + " - " + attempts + ".nzsav";
            link.click();
        }, 200 * i);

        // Increment the number of iterations we've gone through
        i = i + 1;
    })
```

## Troubleshooting

**Cannot read properties of undefined (reading 'pid')**

If you're seeing this issue (or just an "uh oh" Wobbuffett popup), it means the
script read the wrong value... somehow. It worked fine on my side, but people
are reporting this, so it's clearly a problem. I don't have the time this
morning to go in and fix the script, but I'll let you know how to do it
yourself.

First, I would suggest running that same script on the new site so you don't
actually lose all your saves. Since we use the same storage methods as the
original site, this should let you download all your saves, so you don't lose
anything.

The issue with the `pid` is that every game has its own shorthand. For example,
Heart Gold is `hg`, Emerald is `e`, Radical Red is `radred`.

Open the problematic saves in a text editor and search for `game`. You should
see `"game":"something"`. Then, on [this site](https://raw.githubusercontent.com/domtronn/nuzlocke.app/refs/heads/main/src/lib/data/games.json),
search for the game you're trying to import. Once you find it, make sure that
`"something"` in the save's `game` field matches the `pid` on the website.

Here is what this looks like for Heart Gold:

```
  "hg": {
    "pid": "hg",
    "lid": "hgss",
    "logo": "/logos/heart-gold-logo",
    "title": "Heart Gold",
    "gen": "IV",
    "supported": true,
    "region": "johto",
    "filter": {
      "types": "pregen6",
      "moves": "pregen5"
    }
  },
```

If the game has different difficultues (like for Black 2) find the entry in
difficulty that matches it and add everything after the colon for that entry.
For example, normal Black 2 would be `bl2n`.

While I tested the script myself, clearly, behavior is different from person to
person, and I'm not sure why.

If there's anything else wrong, ask in
[the discord server](https://discord.gg/bmsPuMhmxb) and I will try to help.

# Lunarii's Box Testing

## About

Lunarii's Box is an online tool for sketching and sharing instrumental music.
It is a passion project, and also a learning experience for me as a coder, so do expect errors, and bugs.
You can find it [here](https://github.com/lunarriaa/lunariibox).
It is a modification of [Slarmoo's Box](https://slarmoo.github.io/slarmoosbox), which is a modification of [UltraBox](https://ultraabox.github.io), which inturn is a modification of [JummBox](https://github.com/jummbus/jummbox/), which is also a modification of the original, [BeepBox](beepbox.co).

Lunarii's Box is a mod of Slarmoo's Box that aims to advance Beepbox's capabilities. Feel free to contribute!


All song data is packaged into the URL at the top of your browser. When you make
changes to the song, the URL is updated to reflect your changes. When you are
satisfied with your song, just copy and paste the URL to save and share your
song!

Lunarii's Box, as well as the beepmods which it's based on, are free projects. If you ever feel so inclined, please support the original creator, [John Nesky](http://www.johnnesky.com/), via
[PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=QZJTX9GRYEV9N&currency_code=USD)!

## What does this add?

As of right now, it currently improves upon the vanilla UI, by compacting the File, Edit, and Preference menus to be on one row, and removes their text. It also adds tabs, that allow you to switch between different setting views. The default is always Song Settings. It changes the default font to Roboto Flex, and makes a lot of elements cleaner. There is more rhythm choices for you to pick from! (÷2, ÷16). It moves Beats Per Bar to the song settings, as a value you can change. By default it will splice the notes, but if you want more precise choices, use the default prompt. Speaking of prompts, There is now a animation if you open a prompt! <br>

For the nerdy bunch, Lunarii's Box also uses a distinct variant for it's tag code. This means that any song you make in Lunarii's Box, (for now) might not import correctly in other BeepMods. The variant character it uses is 0x6C, which is a lowercase l. 

### That's cool and all, but what else will you add?

Good question!

- Precise rhythm control, allowing user defined values
- Amplitude Modulation as a effect
- Better effects, such as being able to tweak the reverb room size, distortion clip, etc.
- Incorporating [Dockview](https://dockview.dev/demo)
- Custom FM Waveforms
- User Presets, (Export your channel intruments in a prompt, and then import it in a different song/etc, and it appears in the categories!)
- Channel Folders (Group channels together, such as your drums!) <br>

And more that I still haven't thought of yet!

## Compiling

The compilation procedure is identical to the repository for BeepBox. I will include the excerpt on compiling from that page's readme below for convenience:

The source code is available under the MIT license. The code is written in
[TypeScript](https://www.typescriptlang.org/), which requires
[node & npm](https://www.npmjs.com/get-npm), so install those first. Then to
build this project, open a command line ([Git Bash](https://gitforwindows.org/)) and run:

```
git clone https://github.com/lunarriaa/lunariibox
cd lunariibox
npm install
npm run build
```

JummBox (and by extension, Lunarii's Box) makes a divergence from BeepBox that necessitates an additional dependency:
rather than using the (rather poor) default HTML select implementation, the custom
library [select2](https://select2.org) is employed. select2 has an explicit dependency
on [jQuery](https://jquery.com) as well, so you may need to install the following
additional dependencies if they are not picked up automatically.

```
npm install select2
npm install @types/select2
npm install @types/jquery
```

## Code

The code is divided into several folders. This architecture is identical to BeepBox's.

The [synth/](synth) folder has just the code you need to be able to play Lunarii's Box
songs out loud, and you could use this code in your own projects, like a web
game. After compiling the synth code, open website/synth_example.html to see a
demo using it. To rebuild just the synth code, run:

```
npm run build-synth
```

The [editor/](editor) folder has additional code to display the online song
editor interface. After compiling the editor code, open website/index.html to
see the editor interface. To rebuild just the editor code, run:

```
npm run build-editor
```

The [player/](player) folder has a miniature song player interface for embedding
on other sites. To rebuild just the player code, run:

```
npm run build-player
```

The [website/](website) folder contains index.html files to view the interfaces.
The build process outputs JavaScript files into this folder. <br>

The [scripts/](scripts) folder contains the npm scripts that are used to build the above.
It also has two new scripts, courtesy of [Theepbox](https://github.com/Theepicosity/theepbox).
These new scripts, specifically ``live-editor.sh`` and ``live-editor-typeless.sh`` will start a server that hosts the HTML file, and watches the code for any updates, and automatically builds them, with blazingly fast speed, meaning essentially you have a live preview.
If you have issues with these scripts, please talk to Theepicosity, as they are not my scripts, nor my code.

## Dependencies

Most of the dependencies are listed in [package.json](package.json), although
 Lunarii's Box also has an indirect, optional dependency on
[lamejs](https://www.npmjs.com/package/lamejs) via
[jsdelivr](https://www.jsdelivr.com/) for exporting .mp3 files. If the user
attempts to export an .mp3 file, Lunarii's Box will direct the browser to download
that dependency on demand. 
Additionally, random envelopes rely on [js-xxhash](https://npmjs.com/package/js-xxhash) for fast hashing. 


## Offline version

If you'd like to BUILD the offline version, enter the following into the command line of your choice:
```
npm run build-offline
```


After building, you can then enter the following to run it for testing purposes:
```
npm run start
```

And to package, run (do ```npm run package-host``` for your host platform; you may need to run git bash as an administrator for non-host platforms):
```
npm run package
```

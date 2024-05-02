# tabmgr

An extension for managing tab groups in a more dynamic and ephemeral way than Google seems to intend they be used.

I mostly made this for personal use but you may find it useful. There are still a few bugs but it's good enough for me at least. I was thinking about adding a prompt to name tab groups when you create them, but I decided against that, if you want that to be a feature let me know and I'll see if I can be bothered.

## Installation

The chrome web store has a $5 fee to publish and I'm too broke for that shit so you need
to install the plugin manually.

1. Download the source code. Clone it from git, download it as a zip and extract, whatever.
2. Go to chrome://extensions (*Settings* > *Extensions* > *Manage Extensions*)
3. Enable developer mode (Slider in the top right).
4. Click 'Load Unpacked' and point it to the folder containing `manifest.json`.

## Default Controls:

|  Keybind   |    Name    |                Description                  |
| ---------- | ---------- | ------------------------------------------- |
| C-S-t      | New Tab    | Create a new tab in a new tab group.        |
| C-S-m      | Move Tab   | Move the current tab to a new tab group.    |
| C-S-d      | Close      | Close all tabs in the current group.        |
| C-S-o      | Close Else | Close every group except the current one.   |
| \<unbound> | Collapse   | Collapse all groups except the current one. |
| \<unbound> | Expand     | Expand all groups except the current one.   |
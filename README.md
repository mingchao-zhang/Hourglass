# CS498RK Final Project

## Group members
Kevin Su(kys2), Junyoung Kim(jk23), Mingchao Zhang(mz5), Cheng Hu(chenghu3)

## Design
[Design Doc](https://www.behance.net/gallery/76330165/Hourglass)

## Instructions:
This project is a Chrome Web Extension, here the instructions you should follow to run it:
1. In project folder, run: `npm install` and then `npm run build`
2. In Chrome, go to: `chrome://extensions/`, and enable Developer Mode.
3. Click `Loaded unpacked button` and import the build folder inside the project folder.
4. Once the app is added in Chrome, you can open a new tab and see the project home page and explore it.

Alternative, use `web-ext`, a web extension testing utility with hot reloading provided by Mozilla to test in Firefox. To use, install it using `npm install web-ext -g`, then navigate into the build folder and do `web-ext run`.

Chrome has some buggy behavior with its window onFocusChanged event, where it erroneously reports that all Chrome windows become unfocused when browsing normally.
Chrome's window.onFocusChanged event also does not fire when all Chrome windows go out of focus.

Mozilla Firefox does not exhibit any of these issue, thus it is recommended to use Firefox for long-term testing.
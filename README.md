# tinfoil-wishlist

A typical Tinfoil app for creating a wishlist

## Search

In addition to searching by name, you can use tags:
- **pub** - search by publisher (*pub:nintendo*)
- **id** - search by id (*id:0100A250097F0000*)
- **rel** - search by release date (*rel:2020-10*)
- **lmt** - show the limited items, set the offset (*lmt:10* or *lmt:10,20*)
- **from** - search by date from value to present (*from:2020-08-01*)
- **to** - search by date up to value from big bang (*to:2020-10-14*)
- **fromto** - search for between dates(*fromto:2020-08-01,2020-10-14*)

## Build

The commands are used to build:
- **package:mac** - for Mac (note that you need a signature for the key *--osx-sign.identity*)
- **package:win** - for Windows
- **package:linux** - for Linux
- **package** - for all platforms

## License

[MIT](LICENSE.md)

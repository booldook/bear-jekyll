#!/usr/bin/env node
/** * Global Require *********** */
const { Command } = require("commander");
const path = require("path");
const { homedir } = require("os");

const Bear = require("./modules/bear");

/** * User Require *********** */
const { version } = require("./package.json");

/** * Global init *********** */
const program = new Command();

/** * Version *********** */
program.version(version);

/** * Global Variable *********** */
const bearOrigin = `${homedir()}/Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite`;
const imgOrigin = `${homedir()}/Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/Local Files/Note Images`;
const jekyllOrigin = "./_drafts";
const tagOrigin = "post";
const assetOrigin = "./assets/bear";

/** * program options *********** */
program
  .option("-j, --jekyllPath <jekyllPath>", "jekyll's _draft path", jekyllOrigin)
  .option("-t, --tagName <tagName>", "bear's tag name to jekyll", tagOrigin)
  .option(
    "-a, --assetPath <assetPath>",
    "Path where the image will be saved\nExample: ./assets/bear\nCreate and save a folder with the same name as the attachment filename in the above path",
    assetOrigin
  )
  .parse(process.argv);

/** * program parse *********** */
const { tagName, assetPath, jekyllPath } = program.opts();

/** * sqlite init *********** */
const bear = new Bear(
  bearOrigin,
  imgOrigin,
  tagName,
  assetPath,
  path.normalize(path.join(__dirname, jekyllPath))
);

(function init() {
  try {
    const rs = bear.getLists();
    // console.log(rs);
  } catch (err) {
    console.log(err);
  }
})();

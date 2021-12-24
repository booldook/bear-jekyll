const sqlite = require("better-sqlite3");
const path = require("path");
const _ = require("lodash");
const { ensureDirSync, copySync, outputFileSync } = require("fs-extra");
const { v4: uuidv4 } = require("uuid");

/** * Get Bear's posts *********** */
class Bear {
  constructor(_bearPath, _imgPath, _tag, _assetPath, _jekyllPath) {
    this.bearPath = _bearPath;
    this.imgPath = _imgPath;
    this.tag = _tag;
    this.assetPath = _assetPath;
    this.jekyllPath = _jekyllPath;
    this.db = sqlite(this.bearPath);
  }

  getNoteID() {
    const sql = `
      SELECT Z_7NOTES AS noteID
      FROM ZSFNOTETAG
      JOIN Z_7TAGS
      ON Z_7TAGS.Z_14TAGS = ZSFNOTETAG.Z_PK
      WHERE Z_7TAGS.Z_14TAGS = (
        SELECT Z_PK FROM ZSFNOTETAG WHERE ZTITLE LIKE ?
      )`;
    return this.db.prepare(sql).all(this.tag);
  }

  getLists() {
    const id = this.getNoteID();
    if (id.length) {
      let sql = "SELECT * FROM ZSFNOTE WHERE Z_PK IN (";
      for (const v of id) sql += `${v.noteID},`;
      sql = sql.slice(0, -1);
      sql += ") ORDER BY Z_PK ASC";
      let rs = this.db.prepare(sql).all();
      rs = this.changeConfig(rs);
      rs = this.copyImages(rs);
      rs = this.createLists(rs);
      return rs;
    }
    return null;
  }

  changeConfig(rs) {
    for (const v of rs) {
      v.ZTEXT = v.ZTEXT.replace("```jekyll", "---");
      v.ZTEXT = v.ZTEXT.replace("```", "---");
    }
    return rs;
  }

  copyImages(rs) {
    const rs2 = rs.map((v) => {
      const srcTags = v.ZTEXT.match(/\[image:([^\]]+)]/g);
      if (srcTags) {
        for (const v2 of srcTags) {
          const originPath = path.join(
            this.imgPath,
            v2.replace(/\[image:|]/g, "").split("/")[0]
          );
          const targetPath = path.resolve(
            "./",
            this.assetPath,
            v2.replace(/\[image:|]/g, "").split("/")[0]
          );
          const targetFile = path.resolve(
            "./",
            this.imgPath,
            v2.replace(/\[image:|]/g, "")
          );
          copySync(originPath, targetPath);
          v.ZTEXT = _.replace(v.ZTEXT, v2, `![${targetPath}](${targetFile})`);
        }
      }
      return v;
    });
    return rs2;
  }

  createLists(rs) {
    for (const v of rs) {
      const file = path.join(this.jekyllPath, uuidv4() + ".md");
      outputFileSync(file, v.ZTEXT);
    }
  }
}

module.exports = Bear;

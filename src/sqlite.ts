import { Database } from "bun:sqlite";
import termLine from "./term";
const db = new Database('pixiv.db', { create: true });
const tables = db.prepare("select count(*) count from sqlite_master").get() as { count: number }
// 如果数据库没有表执行 table.sql 文件
if (tables.count === 0) {
    termLine.spinner("准备数据")
    const migration = await Bun.file("./sql/table.sql").text()
    db.exec(migration);
    const insert_cookies = db.prepare('insert into account(id,cookies) values(@id,@cookies)')
    insert_cookies.run({
        id: 1,
        cookies: null
    })
    termLine.write("准备完毕")
}
export default db
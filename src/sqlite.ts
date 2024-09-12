import { Database } from 'bun:sqlite'
import termLine from './term'
import type { User } from 'types/follow_user_info'
const db = new Database('pixiv.db', { create: true })
db.run('pragma busy_timeout = 500000;')
const tables = db.prepare('select count(*) count from sqlite_master').get() as { count: number }
// 如果数据库没有表执行 table.sql 文件
if (tables.count === 0) {
  termLine.spinner('准备数据')
  const migration = await Bun.file('./sql/table.sql').text()
  db.exec(migration)
  const insert_cookies = db.prepare('insert into account(id,cookies) values(@id,@cookies)')
  insert_cookies.run({
    id: 1,
    cookies: null
  })
  termLine.write('准备完毕')
}
export function prepareInsertFollowUserAndGetNotFinish() {
  const insertFollowUser = db.prepare('insert into follow_user(user_name,user_id,user_comment,finish) values(@user_name,@user_id,@user_comment,@finish)')
  const selectFollowUser = db.prepare('select *,count(*) count from follow_user where user_id=?')
  return function(user: User[]) {
    const needImgDownloadUser: User[] = []
    user.forEach(v => {
      const count = selectFollowUser.get(v.userId) as { count: number, finish: boolean }
      if (count.count === 0) {
        insertFollowUser.run(v.userName, v.userId, v.userComment, false)
        needImgDownloadUser.push(v)
      } else if (!count.finish) {
        needImgDownloadUser.push(v)
      }
    })
    insertFollowUser.finalize()
    selectFollowUser.finalize()
    return needImgDownloadUser
  }
}
export const insertFollowUserAndGetNotFinish = prepareInsertFollowUserAndGetNotFinish()
export const selectFollowUser = db.prepare('select * from follow_user')
export const updateFollowUser = db.prepare('update follow_user set finish=1 where user_id=?')
export const insertImg = db.prepare('insert into img(img_id,content,url) values(?,?,?)')
export const selectImgByUrl = db.prepare('select count(*) count from img where url=?')
export const selectImgByImgId = db.prepare('select count(*) count from img where img_id=?')
export const selectReDownloadImg = db.prepare('select * from reDownloadImg where finish=0')
export const selectReDownloadImgByUrl = db.prepare('select count(*) count from reDownloadImg where finish=0 and url=?')
export const insetReDownloadImg = db.prepare('insert into reDownloadImg(img_id,content,url,finish) values(?,?,?,?)')
export const updateReDownloadImg = db.prepare('update reDownloadImg set finish=1 where id=?')
export default db
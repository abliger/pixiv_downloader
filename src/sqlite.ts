/**
 * SQLite 数据库操作
 * @module sqlite
 * @description 该模块用于操作 SQLite 数据库，包括创建表、插入数据、查询数据等功能。
 */
import { Database } from 'bun:sqlite'
import type { User } from 'types/follow_user_info'
const db = new Database('pixiv.db', { create: true })
// 设置忙等待超时时间为500秒
db.run('pragma busy_timeout = 500000;')
// 如果数据库没有表,执行 table.sql 文件,并初始化 account 表
const tables = db.query('select count(*) count from sqlite_master').get() as { count: number }
if (tables.count === 0) {
  const migration = await Bun.file('./sql/table.sql').text()
  db.exec(migration)
  const insert_cookies = db.query('insert into account(id,cookies) values(@id,@cookies)')
  insert_cookies.run({
    id: 1,
    cookies: null
  })
}

export function prepareInsertFollowUserAndGetNotFinish() {
  type Obj = { userName: string, userId: string }
  const insertFollowUser = db.query('insert into follow_user(user_name,user_id,user_comment,finish) values(@user_name,@user_id,@user_comment,@finish)')
  const selectFollowUser = db.query('select * from follow_user')
  /**
   * @param user 网络查询该账号关注的用户
   * @returns 
   */
  return function(users: User[]) { 
    const needImgDownloadUser: Obj[] = []
    const followUser = selectFollowUser.all() as { user_name: string, user_id: string,finish:number }[]
    // 首先返回本地存储中未下载完毕的用户
    const all = followUser.filter(user=>user.finish===0).map(v => {
      return {
        userName: v.user_name,
        userId: v.user_id
      }
    })
    needImgDownloadUser.push(...all)

    // 查询 user 是否存在 follow_user 表中如果不存在则返回
    users.forEach(user => {
      const userFind = followUser.find(v=>v.user_id===user.userId) 
      if (!userFind) {
        insertFollowUser.run(user.userName, user.userId, user.userComment, false)
        needImgDownloadUser.push(user)
      }
    })
    insertFollowUser.finalize()
    selectFollowUser.finalize()
    return needImgDownloadUser
  }
}
export const insertFollowUserAndGetNotFinish = prepareInsertFollowUserAndGetNotFinish()
export const insert_message = db.query('insert into log(message,path,stack,create_date) values(?,?,?,?)')
export const selectFollowUser = db.query('select * from follow_user')
export const updateFollowUserToFinishById = db.query('update follow_user set finish=1 where user_id=?')
export const insertImg = db.query('insert into img(img_id,content,url) values(?,?,?)')
export const selectImgByUrl = db.query('select count(*) count from img where url=?')
export const selectImgCountByImgId = db.query('select count(*) count from img where img_id=?')
export const selectImgByImgId = db.query('select * from img where img_id=? and content is not null')
// export const selectImgByImgId = db.query('select img_id img_id from img where img_id in (?) group by img_id') // where in operate is error
export const selectReDownloadImg = db.query('select * from reDownloadImg where finish=0')
export const selectReDownloadImgByUrl = db.query('select count(*) count from reDownloadImg where finish=0 and url=?')
export const insertReDownloadImg = db.query('insert into reDownloadImg(img_id,content,url,finish) values(?,?,?,?)')
export const updateReDownloadImgTofinishById = db.query('update reDownloadImg set finish=1 where id=?')
export default db
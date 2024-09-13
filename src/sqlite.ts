import { Database } from 'bun:sqlite'
import termLine from './term'
import type { User } from 'types/follow_user_info'
const db = new Database('pixiv.db', { create: true })
db.run('pragma busy_timeout = 500000;')
const tables = db.query('select count(*) count from sqlite_master').get() as { count: number }
// 如果数据库没有表执行 table.sql 文件
if (tables.count === 0) {
  termLine.spinner('准备数据')
  const migration = await Bun.file('./sql/table.sql').text()
  db.exec(migration)
  const insert_cookies = db.query('insert into account(id,cookies) values(@id,@cookies)')
  insert_cookies.run({
    id: 1,
    cookies: null
  })
  termLine.write('准备完毕')
}
export function prepareInsertFollowUserAndGetNotFinish() {
  type Obj={userName:string,userId:string}
  const insertFollowUser = db.query('insert into follow_user(user_name,user_id,user_comment,finish) values(@user_name,@user_id,@user_comment,@finish)')
  const selectFollowUser = db.query('select *,count(*) count from follow_user where user_id=?')
  const selectFollowUserByFinishEqZero=db.query('select * from follow_user where finish=0')
  return function(user: User[]) {
    const needImgDownloadUser: Obj[] = []
    user.forEach(v => {
      const count = selectFollowUser.get(v.userId) as { count: number, finish: boolean }
      if (count.count === 0) {
        insertFollowUser.run(v.userName, v.userId, v.userComment, false)
        needImgDownloadUser.push(v)
      } else if (!count.finish) {
        needImgDownloadUser.push(v)
      }
    })
    if(user.length===0){
      const all=selectFollowUserByFinishEqZero.all() as Obj[]
      needImgDownloadUser.push(...all)
    }
    insertFollowUser.finalize()
    selectFollowUser.finalize()
    return needImgDownloadUser
  }
}
export const insertFollowUserAndGetNotFinish = prepareInsertFollowUserAndGetNotFinish()
export const insert_message = db.query('insert into log(message,path,stack,create_date) values(?,?,?,?)')
export const selectFollowUser = db.query('select * from follow_user')
export const updateFollowUser = db.query('update follow_user set finish=1 where user_id=?')
export const insertImg = db.query('insert into img(img_id,content,url) values(?,?,?)')
export const selectImgByUrl = db.query('select count(*) count from img where url=?')
export const selectImgByImgId = db.query('select count(*) count from img where img_id=?')
// export const selectImgByImgId = db.query('select img_id img_id from img where img_id in (?) group by img_id') // where in operate is error
export const selectReDownloadImg = db.query('select * from reDownloadImg where finish=0')
export const selectReDownloadImgByUrl = db.query('select count(*) count from reDownloadImg where finish=0 and url=?')
export const insertReDownloadImg = db.query('insert into reDownloadImg(img_id,content,url,finish) values(?,?,?,?)')
export const updateReDownloadImg = db.query('update reDownloadImg set finish=1 where id=?')
export default db
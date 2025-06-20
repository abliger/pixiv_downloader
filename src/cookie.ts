import type { Cookie } from 'puppeteer'
import { Login } from 'src/login'
import db from 'src/sqlite'

let cookieArray: Cookie[] | undefined
let userId: string | undefined
const selectAccountInfo = db.prepare('SELECT * FROM account WHERE id = 1')
// 优先根据 .env 文件获取账号信息
const { cookies, user_id } = {cookies:process.env.COOKIES, user_id: process.env.USER_ID}
// 如果cookies 和 user_id 都存在,则从数据库中查询
// 如果都不存在,查询 account 中是否存在账号信息
//   如果本地不存在账号信息,则使用 puppeteer 模拟登录获取 cookies 和 user_id 保存到本地
//   如果存在账号信息,则判断 cookies 是否过期
//     如果 cookies 过期了,则重新登录获取 cookies 和 user_id
//     如果 cookies 没有过期,则使用数据库中的 cookies 和 user_id
// 如果只存在 cookies 或 user_id,则抛出错误
if(cookies && user_id){
  cookieArray = JSON.parse(cookies) as Cookie[]
  userId = user_id
}else if(!cookies && !user_id){
  if(process.env.USERNAME && process.env.PASSWORD){
    let accountInfo = selectAccountInfo.get() as { cookies: string, user_id: string, id: number }
    if(!accountInfo.cookies){
      const cookie = await fetchAndSaveCookies()
      await saveAccount(cookie)
      accountInfo = selectAccountInfo.get() as { cookies: string, user_id: string, id: number }
    }
    const sessionCookie = (JSON.parse(accountInfo.cookies) as Cookie[]).find((it: { name: string }) => it.name === 'PHPSESSID')
    userId = sessionCookie?.value.split('_')[0] as string
    const cookieDate = sessionCookie?.expires || 0
    if(cookieDate < Date.now()/1000){
      // 如果 cookies 过期了,则重新登录获取 cookies
      cookieArray = await fetchAndSaveCookies()
    }else{
      // 如果 cookies 没有过期,则使用数据库中的 cookies
      cookieArray = JSON.parse(accountInfo.cookies) as Cookie[]
      userId = accountInfo.user_id
      if (!userId) {
        throw new Error('PHPSESSID cookie not found in the account info')
      }
      if (!cookieArray || cookieArray.length === 0) {
        throw new Error('Cookies not found in the account info')
      }
    }
  }else{
    throw new Error('请在 .env 文件中设置 USERNAME 和 PASSWORD')
  }
}else{
  throw new Error('请在 .env 文件中设置 COOKIES 和 USER_ID')
}

async function saveAccount(newCookieArray: Cookie[]) {
  const updateStmt = db.prepare('UPDATE account SET cookies =?, user_id =? WHERE id =?')
  const userId=newCookieArray.find((it: { name: string }) => it.name === 'PHPSESSID')?.value.split('_')[0]
  if (!userId) {
    throw new Error('PHPSESSID cookie not found in the new cookie array')
  }
  return await db.transaction(() => {
    updateStmt.run(JSON.stringify(newCookieArray), userId , 1)
    updateStmt.finalize()
  })
}

async function fetchAndSaveCookies() {
  const newCookieArray = await Login(process.env.USERNAME, process.env.PASSWORD)
  await saveAccount(newCookieArray)
  return newCookieArray 
}

export default {
  cookieArray,
  userId,
  fetchAndSaveCookies,
}
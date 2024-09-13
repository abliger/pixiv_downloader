import type { Cookie } from 'puppeteer'
import { Login } from 'src/login'
import db from 'src/sqlite'

const selectAccountInfo = db.prepare('SELECT * FROM account WHERE id = 1')
const { id, cookies, user_id } = selectAccountInfo.get() as { id: number, cookies: string, user_id: string }
let userId: string = user_id
selectAccountInfo.finalize()

let cookieArray: Cookie[] | undefined
if (cookies) {
  cookieArray = JSON.parse(cookies)
} else {
  cookieArray = await fetchAndSaveCookies()
}

async function fetchAndSaveCookies() {
  const newCookieArray = await Login(process.env.USERNAME, process.env.PASSWORD)
  const sessionCookie = newCookieArray.find((it) => it.name === 'PHPSESSID')
  if (sessionCookie) {
    userId = sessionCookie.value.split('_')[0] as string
    const saveAccountInfo = db.transaction(() => {
      const updateStmt = db.prepare('UPDATE account SET cookies =?, user_id =? WHERE id =?')
      updateStmt.run(JSON.stringify(newCookieArray), userId, id)
      updateStmt.finalize()
    })
    await saveAccountInfo()
    return newCookieArray
  } else {
    throw new Error('PHPSESSID cookie not found')
  }
}

export default {
  cookieArray,
  userId,
  fetchAndSaveCookies,
}
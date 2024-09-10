import type { Cookie } from 'puppeteer';
import { Login } from 'src/login';
import db from 'src/sqlite'

const selectMyInfo = db.prepare('SELECT * FROM account WHERE id = 1')
const { cookies, user_id } = selectMyInfo.get() as { id: number, cookies: string, user_id: string }
let userId: string = user_id
selectMyInfo.finalize()
let cookieArray: Cookie[] | undefined
if (cookies) {
    cookieArray = JSON.parse(cookies)
} else {
    cookieArray = await getAndSaveCookies()
}


async function getAndSaveCookies() {
    try {
        let cookieArray = await Login(process.env.USERNAME, process.env.PASSWORD);
        let c = cookieArray.find(it => it.name === "PHPSESSID")
        userId = c?.value.split("_")[0] as string
        const saveMyInfo = db.prepare('update account set cookies=?, user_id=? where id = ?')
        saveMyInfo.run(JSON.stringify(cookieArray), userId, 1)
        saveMyInfo.finalize()
        return cookieArray
    } catch (e) {
        if (e instanceof Error) {
            console.log(e.message);
        }
    }
}
export default {
    cookieArray,
    userId,
    getAndSaveCookies
}

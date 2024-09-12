import puppeteer, { Page, type Cookie } from 'puppeteer'
enum LoginMateData {
    LoginPath = 'https://accounts.pixiv.net/login?return_to=https%3A%2F%2Fwww.pixiv.net%2F&lang=zh&source=pc&view_type=page',
    UserInputLocation = '#app-mount-point > div > div > div.sc-fvq2qx-4.bVIVOB > div.sc-2oz7me-0.bOKfsa > div.sc-fg9pwe-2.cFfXcg > div > div > div > form > fieldset.sc-bn9ph6-0.bYwpCj.sc-2o1uwj-4.jZgbmK > label > input',
    PasswordInputLocation = '#app-mount-point > div > div > div.sc-fvq2qx-4.bVIVOB > div.sc-2oz7me-0.bOKfsa > div.sc-fg9pwe-2.cFfXcg > div > div > div > form > fieldset.sc-bn9ph6-0.bYwpCj.sc-2o1uwj-5.duclA-d > label > input',
    ToLoginButtonLocation = '#app-mount-point > div > div > div.sc-fvq2qx-4.bVIVOB > div.sc-2oz7me-0.bOKfsa > div.sc-fg9pwe-2.cFfXcg > div > div > div > form > button'
}

/**
 * 登陆,由于使用 puppeteer 模拟登陆与 pixiv api分离
 * @param username 用户
 * @param password 密码
 * @returns Cookies[]
 */
export async function Login(username: string, password: string): Promise<Cookie[]> {
  const browser = await puppeteer.launch({ headless: Boolean(process.env.HEADLESS) })
  const page = await browser.newPage()
  await page.goto(LoginMateData.LoginPath)
  await scroll(800, page)
  await page.locator(LoginMateData.UserInputLocation).fill(username)
  await page.locator(LoginMateData.PasswordInputLocation).fill(password)
  await Bun.sleep(Math.floor(Math.random() * 100))
  await page.locator(LoginMateData.ToLoginButtonLocation).click()
  while (page.url() === LoginMateData.LoginPath) {
    await Bun.sleep(1000)
  }
  const cookies = await page.cookies()
  await browser.close()
  return cookies
}
/**
 * 模拟用户翻滚 
 * @param toTop 滚动高度
 * @param page 当前页面对象
 */
async function scroll(toTop: number, page: Page) {
  let currentHeight = 0
  while (currentHeight < toTop) {
    const interval = Math.floor(Math.random() * 10)
    currentHeight += Math.floor(Math.random() * 10)
    await page.locator('html').scroll({
      scrollTop: currentHeight
    })
    await Bun.sleep(interval)
  }
}



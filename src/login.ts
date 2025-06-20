import puppeteer, { Page, type Cookie } from 'puppeteer'
enum LoginPageSelectors {
    LoginPath = 'https://accounts.pixiv.net/login?return_to=https%3A%2F%2Fwww.pixiv.net%2F&lang=zh&source=pc&view_type=page',
    UserInputLocation = '#app-mount-point > div > div > div.sc-fvq2qx-4.bntRDI > div.sc-2oz7me-0.iGLGot > form > fieldset.sc-bn9ph6-0.bYwpCj.sc-2o1uwj-5.brtxjH > label > input',
    PasswordInputLocation = '#app-mount-point > div > div > div.sc-fvq2qx-4.bntRDI > div.sc-2oz7me-0.iGLGot > form > fieldset.sc-bn9ph6-0.bYwpCj.sc-2o1uwj-6.eTXdqi > label > input',
    ToLoginButtonLocation = '#app-mount-point > div > div > div.sc-fvq2qx-4.bntRDI > div.sc-2oz7me-0.iGLGot > form > button.charcoal-button.sc-2o1uwj-9.cgXaWj'
}

/**
 * 登陆,由于使用 puppeteer 模拟登陆与 pixiv api分离
 * todo 可能需要人机验证,如果出现验证码,需要手动输入
 * 注意需要代理
 * @param username 用户
 * @param password 密码
 * @returns Cookies[]
 */
export async function Login(username: string, password: string): Promise<Cookie[]> {
  const browser = await puppeteer.launch({ headless: Boolean(process.env.HEADLESS) ,timeout: 300000})
  const page = await browser.newPage()
  try {
    await page.goto(LoginPageSelectors.LoginPath)
    await scroll(600, page)
    await page.locator(LoginPageSelectors.UserInputLocation).fill(username)
    await Bun.sleep(1112)
    await page.locator(LoginPageSelectors.PasswordInputLocation).fill(password)
    await Bun.sleep(Math.floor(Math.random() * 100))
    await page.locator(LoginPageSelectors.ToLoginButtonLocation).click()
    await page.waitForNavigation()
    const cookies = await page.cookies()
    return cookies
  } catch (error) {
    // 记录错误日志或者进行其他错误处理
    console.error(`登录失败: ${error}`)
    throw error
  } finally {
    await browser.close()
  }
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



import { expect, test, describe } from 'bun:test'


import db from 'src/sqlite'


describe.only('cookie.ts test', () => {
  test('cookie', async done => {
    const changeRow = db.prepare('update account set cookies=null,user_id=null').run()
    const cookie = (await import('../src/cookie')).default
    expect(changeRow.changes).toEqual(1)
    expect(cookie.userId).not.toBeEmpty()
    expect(cookie.userId).toEqual('33430457')
    expect(cookie.cookieArray?.find(it => it.name === 'PHPSESSID')?.value).toContain('33430457')
    const phpsessid = cookie.cookieArray?.find(v => {
      return v.name === 'PHPSESSID'
    })
    expect(phpsessid).not.toBeEmpty()
    expect(phpsessid?.value).toContain('33430457')
    done()
  }, 100000)
})
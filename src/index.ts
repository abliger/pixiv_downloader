import chalk from 'chalk'
import cookie from './cookie'
import pixiv_api from './pixiv_api'
import term from './term'
import util from './util'
import { insertFollowUserAndGetNotFinish, selectFollowUser, selectReDownloadImg, updateFollowUser, updateReDownloadImg } from './sqlite'
import type { PhoneImgDownloadInfo } from 'types/phoneImgDownloadInfo'

// 开始查询 redownloadimg 表 重新下载超时照片
const all =selectReDownloadImg.all() as {id:string,img_id:string,content:string,url:string,finish:boolean}[]
const spinnerImg = term.spinnerEq('spinnerSuffix')
for (const img of all) {
  const info={illust_details:JSON.parse(img.content)} as PhoneImgDownloadInfo
  term.spinner(`下载超时图片 作者: ${info.illust_details.author_details.user_name} 图片: ${info.illust_details.title?info.illust_details.title:'unknow'} id: ${info.illust_details.id}`)
  spinnerImg(all.length)
  await pixiv_api.download(info)
  updateReDownloadImg.run(img.id)
}
// 获得用户
term.spinner('正在获取用户信息\n')
let needDownloadUser = selectFollowUser.all() as { user_name: string, user_id: string, user_comment: string, finish: boolean }[]
if (needDownloadUser.length === 0) {
  const user = await pixiv_api.getFollowPageInfoAll(cookie.userId)
  needDownloadUser = insertFollowUserAndGetNotFinish(user).map(v => {
    return {
      user_name: v.userName,
      user_id: v.userId,
      user_comment: '',
      finish: false
    }
  })
}
needDownloadUser = needDownloadUser.filter(v => !v.finish)
term.spinner(`需要下载 ${chalk.red(needDownloadUser.length)} 个用户\n`)
const flag = await term.inputBool('开始下载')
if (!flag) {
  process.exit()
}


// 如果 needDownloadUser 为空,只去最新的图片去下载 followLatestIllust
if (needDownloadUser.length === 0) {
  term.writeLine('下载最新图片\n')
  const imgs = await pixiv_api.followLatestIllust()
  for (const imgid of imgs.page.ids) {
    // todo 如果ID重复 跳过查询
    const info = await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo(String(imgid))
    await pixiv_api.download(info)
  }
} else {
  // 遍历用户开始下载
  const spinnerUser = term.spinnerEq('spinnerPrefix')
  for (const u of needDownloadUser) {
    spinnerUser(needDownloadUser.length)
    // 如果有结果没有获得到,过滤掉,该用户设置为完成
    let flag = false
    const imgAll = await util.getUserImgAllByPhone(u.user_id).then(v => v.filter(v => {
      if (v) {
        return v
      } else {
        flag = true
        return false
      }
    }))
    if (imgAll.length === 0) {
      continue
    }
    let spinnerImg = term.spinnerEq('spinnerSuffix')
    term.spinner(`用户 ${u.user_name} 总计 ${imgAll.length} 开始下载\n`)
    spinnerImg = term.spinnerEq('spinnerSuffix')
    for (const info of imgAll) {
      spinnerImg(imgAll.length)
      await pixiv_api.download(info)
    }
    if (!flag) {
      updateFollowUser.run(u.user_id)
    }
  }
}
term.closeSpinner()
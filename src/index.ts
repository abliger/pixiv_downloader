import chalk from 'chalk'
import cookie from './cookie'
import pixiv_api from './pixiv_api'
import term from './term'
import util from './util'

import { insertFollowUserAndGetNotFinish, selectImgByImgId, selectReDownloadImg, updateFollowUser, updateReDownloadImg } from './sqlite'
import type { PhoneImgDownloadInfo } from 'types/phoneImgDownloadInfo'
import { exiftool } from 'exiftool-vendored'

// 开始查询 redownloadimg 表 重新下载超时照片
async function downloadTimeoutImages() {
  const allImages = selectReDownloadImg.all() as { id: string, img_id: string, content: string, url: string, finish: boolean }[]
  const spinnerImg = term.spinnerEq('spinnerSuffix')
  for (const img of allImages) {
    try {
      const info = { illust_details: JSON.parse(img.content) } as PhoneImgDownloadInfo
      term.spinner(`下载超时图片 作者: ${info.illust_details.author_details.user_name} 图片: ${info.illust_details.title? info.illust_details.title : 'unknow'} id: ${info.illust_details.id}`)
      spinnerImg(allImages.length)
      await pixiv_api.download(info)
      updateReDownloadImg.run(img.id)
    } catch (error) {
      // 记录错误日志或者进行其他错误处理
      console.error(`下载超时图片失败: ${error}`)
    }
  }
}

// 获得用户
async function getUsers() {
  term.spinner('正在获取用户信息\n')
  const user = await pixiv_api.getFollowPageInfoAll(cookie.userId)
  let needDownloadUser = insertFollowUserAndGetNotFinish(user).map(v => {
    return {
      user_name: v.userName,
      user_id: v.userId,
      user_comment: '',
      finish: false
    }
  })
  needDownloadUser = needDownloadUser.filter(v =>!v.finish)
  term.spinner(`需要下载 ${chalk.red(needDownloadUser.length)} 个用户\n`)
  return needDownloadUser
}

// 下载最新图片
async function downloadLatestImages() {
  term.writeLine('下载最新图片\n')
  const spinnerImgNew = term.spinnerEq('spinnerSuffix')
  const imgs = await pixiv_api.followLatestIllust()
  if (!imgs) {
    term.spinner('获取最新图片失败')
  } else {
    for (const imgid of imgs.page.ids) {
      spinnerImgNew(imgs.page.ids.length)
      const count = selectImgByImgId.get(imgid) as { count: number }
      if (count.count) {
        continue
      }
      const info = await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo(String(imgid))
      if (info) {
        await pixiv_api.download(info)
      }
    }
  }
}

// 遍历用户开始下载
async function downloadUserImages(users: { user_name: string, user_id: string, user_comment: string, finish: boolean }[]) {
  const spinnerUser = term.spinnerEq('spinnerPrefix')
  for (const u of users) {
    spinnerUser(users.length)
    let flag = false
    let imgAll = await util.getUserImgAllByPhone(u.user_id, u.user_name)
    if (imgAll.length === 0) {
      updateFollowUser.run(u.user_id)
    }
    imgAll = imgAll.filter(v => {
      if (v) {
        return v
      } else {
        flag = true
        return false
      }
    })
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

async function main() {
  await downloadTimeoutImages()
  const users = await getUsers()
  await downloadLatestImages()
  await downloadUserImages(users)
  exiftool.end()
  term.closeSpinner()
}

main().then(() => {
  process.exit()
}).catch(error => {
  console.error(`程序出现错误: ${error}`)
  process.exit(1)
})
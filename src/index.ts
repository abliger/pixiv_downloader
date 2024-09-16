import chalk from 'chalk'
import cookie from './cookie'
import pixiv_api from './pixiv_api'
import util from './util'

import { insertFollowUserAndGetNotFinish, selectImgByImgId, selectReDownloadImg, updateFollowUser, updateReDownloadImg } from './sqlite'
import type { PhoneImgDownloadInfo } from 'types/phoneImgDownloadInfo'
import { exiftool } from 'exiftool-vendored'
import { messageLog } from './message_log'

// 开始查询 redownloadimg 表 重新下载超时照片
async function downloadTimeoutImages() {
  const allImages = selectReDownloadImg.all() as { id: string, img_id: string, content: string, url: string, finish: boolean }[]
  let count = 0
  for (const img of allImages) {
    count += 1
    try {
      const info = { illust_details: JSON.parse(img.content) } as PhoneImgDownloadInfo
      console.log(`下载超时图片 作者: ${info.illust_details.author_details.user_name} 图片: ${info.illust_details.title ? info.illust_details.title : 'unknow'} id: ${info.illust_details.id} 当前位置: ${count} 总计: ${allImages.length}`)
      await pixiv_api.download(info)
      updateReDownloadImg.run(img.id)
    } catch (error) {
      // 记录错误日志或者进行其他错误处理
      messageLog({ message: `下载超时图片失败: ${error}` })
    }
  }
}

// 获得用户
async function getUsers() {
  const user = await pixiv_api.getFollowPageInfoAll(cookie.userId)
  let needDownloadUser = insertFollowUserAndGetNotFinish(user).map(v => {
    return {
      user_name: v.userName,
      user_id: v.userId,
      user_comment: '',
      finish: false
    }
  })
  needDownloadUser = needDownloadUser.filter(v => !v.finish)
  console.log(`需要下载 ${chalk.red(needDownloadUser.length)} 个用户`)
  return needDownloadUser
}

// 下载最新图片
async function downloadLatestImages() {
  console.log('下载最新图片\n')
  const imgs = await pixiv_api.followLatestIllust()
  if (!imgs) {
    console.log('获取最新图片失败')
  } else {
    let countN = 0
    for (const imgid of imgs.page.ids) {
      countN += 1
      console.log(`当前位置: ${countN} 总计: ${imgs.page.ids.length}`)
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
  let countN = 0
  for (const u of users) {
    countN += 1
    console.log(`当前位置: ${countN} 总计: ${users.length}`)
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
    console.log(`用户 ${u.user_name} 总计 ${imgAll.length} 开始下载`)
    let countM = 0
    for (const info of imgAll) {
      countM += 1
      console.log(`当前位置: ${countM} 总计: ${imgAll.length}`)
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
}

main().then(() => {
  process.exit()
}).catch(error => {
  messageLog({ message: `程序出现错误: ${error}` })
  process.exit(1)
})
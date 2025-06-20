import type { ImgInfo, ImgTag } from 'types/img_info'
import pixiv_api from './pixiv_api'
import type { Displaytag, Illustdetails, PhoneImgDownloadInfo } from 'types/phoneImgDownloadInfo'
import { downloadImg } from './axios'
import { insertReDownloadImg, selectImgByImgId, selectReDownloadImgByUrl } from './sqlite'
import { exiftool } from 'exiftool-vendored'
import { messageLog } from './message_log'

export default {
  async getUserImgAll(userid: string) {
    const { can_send } = await pixiv_api.isUserCanSend(userid)
    if (!can_send) {
      throw new Error(`该用户ID ${userid} 不能发送信息`)
    }
    const userAllInfo = await pixiv_api.getUserProfileAll(userid)
    const imgIds = Object.keys(userAllInfo.illusts)
    const oneSearchMaxCount = 48
    const total = imgIds.length
    let currentImg = 0
    const imgInfos: ImgInfo[] = []
    const imgTags: ImgTag[] = []
    while (currentImg < total) {
      const imgInfo = await pixiv_api.getImgInfo(userid, imgIds.slice(currentImg, currentImg + oneSearchMaxCount))
      const imgTag = await pixiv_api.getImgTagInfo(imgIds.slice(currentImg, currentImg + oneSearchMaxCount))
      objMix(imgInfos, Object.values(imgInfo.works), 'id')
      objMix(imgTags, imgTag, 'tag')
      currentImg += oneSearchMaxCount
    }
    return [imgInfos, imgTags]
  },
  async getUserImgAllByPhone(userId: string, userName: string) {
    const userAllInfo = await pixiv_api.getUserProfileAll(userId)
    if (!userAllInfo) {
      throw new Error(`没有获取到 ${userName} 的插画信息,请排查网络后再试`)
    }
    // todo bun sqlite where in operate is error
    // 如果 userAllInfo.illusts 对应的是插画集则返回这个 id
    const imgIds = Object.keys(userAllInfo.illusts).filter(v => {
      const content = JSON.parse((selectImgByImgId.get(v) as {content: string}).content) as Illustdetails
      if(!content){
        return false
      }else if(content.illust_images.length > 1) {
        return false
      }else{
        return true
      }
    })

    const imgs: PhoneImgDownloadInfo[] = []
    let currentId = 0
    console.log(`获得 ${userName} 的插画信息`)
    let countM = 0
    while (currentId <= imgIds.length) {
      countM += 1
      console.log(`当前位置: ${countM} 总计: ${imgIds.length}`)
      const ids = imgIds.slice(currentId, currentId + 5)
      const imgTemp = await Promise.all(ids.map(async v => {
        return await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo(v)
      })).catch(() => [])
      imgs.push(...imgTemp)
      currentId += 5
      //  如果作者插画太多,减慢请求频率
      if (imgIds.length > 50) {
        await Bun.sleep(100)
      }
    }
    if(imgs.length === 0 && imgIds.length > 0) {
      throw new Error(`没有获取到 ${userName} 的插画信息,请排查网络后再试`)
    }
    return imgs
  },
  async writeExtraFileInfo(fileName: string, description: string, tag: string[]) {
    try {
      return await exiftool.write(fileName, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        MDItemFinderComment: description,
        MDItemUserTags: tag
      })
    } catch (error) {
      if (error instanceof Error) {
        messageLog({ message: `写入文件额外信息失败: ${error.message}`, path: undefined, stack: error.stack })
        exiftool.closeChildProcesses()
      }
      return null
    }
  },

  async download(fileName: string, url: string, description: string, tag: string[], id: string, content: string) {
    try {
      const response = await downloadImg().get(url, { responseType: 'arraybuffer' })
      if (response) {
        await Bun.write(Bun.file(fileName), response.data)
        await this.writeExtraFileInfo(fileName, description, tag)
      }
    } catch (e) {
      if (e instanceof Error) {
        messageLog({ message: e.message, path: undefined, stack: e.stack })
      }
      const count = selectReDownloadImgByUrl.get(url) as { count: number }
      if (count.count === 0) {
        insertReDownloadImg.run(id, content, url, false)
      }
      return
    }
  }
}
export function objMix<T>(arrOut: T[], oriArr: T[], key: keyof T) {
  oriArr.forEach((t) => {
    let flag = true
    arrOut.forEach(e => {
      if (t[key] === e[key]) {
        flag = false
      }
    })
    if (flag) {
      arrOut.push(t)
    }
  })
  return arrOut
}
export function translationTag(_: string[], display_tags: Displaytag[]): string[] {
  const tags: string[] = []
  display_tags.forEach(v => {
    tags.push(v.tag)
    if (v.translation) {
      tags.push(v.translation)
    }
  })
  return tags
}
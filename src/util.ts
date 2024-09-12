import type { ImgInfo, ImgTag } from 'types/img_info'
import pixiv_api from './pixiv_api'
import type { Displaytag } from 'types/phoneImgDownloadInfo'
import { exiftool } from 'exiftool-vendored'
import { downloadImg } from './axios'
import { insetReDownloadImg, selectReDownloadImgByUrl } from './sqlite'

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
  async getUserImgAllByPhone(userId: string) {
    // 23739239 虽然可以查看图片蛋 返回 false
    // let { can_send } = await pixiv_api.isUserCanSend(userId)
    // if (!can_send) {
    //     throw new Error(`${can_send} 该用户ID ${userId} 不能发送信息`)
    // }
    const userAllInfo = await pixiv_api.getUserProfileAll(userId)
    if (!userAllInfo) {
      return []
    }
    const imgIds = Object.keys(userAllInfo.illusts)
    // let imgInfos: PhoneImgDownloadInfo[] = []
    return await Promise.all(imgIds.map(async v => {
      return await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo(v)
    }))
  },
  async writeExtraFileInfo(fileName: string, description: string, tag: string[]) {
    return await exiftool.write(fileName, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      MDItemFinderComment: description,
      MDItemUserTags: tag
    })
  },
  async download(fileName: string, url: string, description: string, tag: string[], id: string, content: string) {
    return await downloadImg().get(url, {
      responseType: 'arraybuffer'
    }).then(async v => {
      await Bun.write(Bun.file(fileName), v.data)
      this.writeExtraFileInfo(fileName, description, tag)
    }).catch(() => {
      let countTimeout =0 
      setInterval(()=>{
        countTimeout = 0
      },100000)
      countTimeout +=1
    
      const count = selectReDownloadImgByUrl.get(url) as {count:number}
      if(count.count === 0){
        insetReDownloadImg.run(id, content, url, false)
      }
      // 100 秒内超时10次退出程序
      if(countTimeout >10){
        throw new Error('网络不稳定,请稍后再试')
      }
    })
  }
}
export function objMix<T extends { [U in keyof T]: unknown }>(arrOut: T[], oriArr: T[], key: keyof T) {
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
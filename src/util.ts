import type { ImgInfo, ImgTag } from 'types/img_info'
import pixiv_api from './pixiv_api'
import type { Displaytag, PhoneImgDownloadInfo } from 'types/phoneImgDownloadInfo'
import { downloadImg } from './axios'
import { insertReDownloadImg, selectImgByImgId, selectReDownloadImgByUrl } from './sqlite'
import term from './term'
import { exiftool } from 'exiftool-vendored'

let countTimeout =0 
setInterval(()=>{
  countTimeout = 0
},100000)

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
  async getUserImgAllByPhone(userId: string,userName:string) {
    const userAllInfo = await pixiv_api.getUserProfileAll(userId)
    if (!userAllInfo) {
      return []
    }
    // todo bun sqlite where in operate is error
    const imgIds = Object.keys(userAllInfo.illusts).filter(v=>{
      const count =selectImgByImgId.get(v) as {count:number}
      return count.count===0?true:false
    })
    
    const imgs:PhoneImgDownloadInfo[]=[]
    let currentId=0
    term.spinner(`获得 ${userName} 的插画信息`)
    const termSuffix=term.spinnerEq('spinnerSuffix')
    while(currentId<=imgIds.length){
      termSuffix(Math.floor(imgIds.length/5)+1)
      const ids=imgIds.slice(currentId,currentId+5)
      const imgTemp=await Promise.all(ids.map(async v => {
        return await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo(v)
      })).catch(()=>[])
      imgs.push(...imgTemp)
      currentId+=5
      //  如果作者插画太多,减慢请求频率
      if(imgIds.length>50){
        await Bun.sleep(100)
      }
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
        console.error(`写入文件额外信息失败: ${error.message}`)
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      countTimeout++
      const count = selectReDownloadImgByUrl.get(url) as { count: number }
      if (count.count === 0) {
        // 如果下载失败，尝试插入重新下载记录，但要确保在插入操作失败时也能正确处理
        try {
          insertReDownloadImg.run(id, content, url, false)
        } catch (insertError) {
          console.error(`插入重新下载记录失败: ${insertError}`)
        }
      }
      if (countTimeout > 10) {
        throw new Error('网络不稳定，请稍后再试')
      }
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
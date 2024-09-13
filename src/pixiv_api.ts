import type { Lang, Mode, userExtraResult, Body, CanSendResult } from 'types/pixiv'
import type { UserProfileAllResult } from 'types/pixiv_profile_all'
import { http,  phoneHttp } from './axios'
import type { UserLatestResult } from 'types/user_latest'
import type { ImgDownloadInfo } from 'types/img_download_info'
import type {  ImgInfos, ImgTag } from 'types/img_info'
import type { FollowUserInfo, User } from 'types/follow_user_info'
import type { Mangaa, PhoneImgDownloadInfo } from 'types/phoneImgDownloadInfo'
import util, { translationTag } from './util'
import { insertImg, selectImgByUrl } from './sqlite'
import term from './term'

const service = http()
const phoneService = phoneHttp()

class Pixiv {
  /**
     * 判断用户是否能公开
     * @param userId 
     * @param lang 
     * @returns 
     */
  async isUserCanSend(userId: string, lang: Lang = 'zh'): Promise<CanSendResult> {
    return await service.get(`message/can_send/${userId}`, {
      params: { lang }
    })
  }
  /**
     * 获得图片下载信息
     * @param imgId 图片id
     * @param lang 
     * @returns 
     */
  async getImgDownloadInfo(imgId: string, lang: Lang = 'zh'): Promise<ImgDownloadInfo[]> {
    return await service.get(`illust/${imgId}/pages`, {
      params: { lang }
    })
  }
  /**
     * 获得用户插画和小说
     * @param userId 
     * @param lang 
     * @returns 
     */
  async getUserProfileAll(userId: string, lang: Lang = 'zh'): Promise<UserProfileAllResult> {
    return await service.get(`user/${userId}/profile/all`, {
      params: { lang }
    })
  }
  /**
     * 获得用户插画和小说
     * @param userId 
     * @param lang 
     * @returns 
     */
  async getUserInfo(userId: string, lang: Lang = 'zh'): Promise<UserLatestResult> {
    return await service.get(`user/${userId}/works/latest`, {
      params: { lang }
    })
  }
  async getFollowPageInfoAll(userId: string) {
    const user: User[] = []
    const info = await this.getFollowPageInfo(userId)
    if(!info){
      term.writeLine('获取不到最新用户数据,从数据库查找用户')
      return []
    }
    const { users, total } = info
    user.push(...users)
    function* getFollowingUserIter(that: Pixiv) {
      let currentPage = 1
      while (currentPage * 24 < total + 24) {
        yield that.getFollowPageInfo(userId, currentPage * 24, 24, 'show')
        currentPage += 1
      }
    }

    const bigUsers = await Promise.all(getFollowingUserIter(this))
    bigUsers.filter(v=>v).forEach(v => {
      user.push(...v.users)
    })
    return user
  }
  /**
     * 获得关注列表
     * @param userId 
     * @param offset 
     * @param limit 
     * @param rest 
     * @param tag 
     * @param acceptingRequests 是否接稿件 1 显示接稿件用户 0 显示全部
     * @param lang 
     * @returns 
     */
  async getFollowPageInfo(userId: string, offset = 0, limit = 24, rest: 'show' | 'hide' = 'show', tag = [], acceptingRequests = 0, lang: Lang = 'zh'): Promise<FollowUserInfo> {
    return await service.get(`user/${userId}/following`, {
      params: { offset, limit, rest, tag, acceptingRequests, lang }
    })
  }
  /**
     * 最新图片
     */
  async followLatestIllust(p = 1, mode: Mode = 'all', lang: Lang = 'zh'): Promise<Body> {
    return await service.get('follow_latest/illust', {
      params: {
        p, mode, lang
      }
    })
  }
  /**
     * 最新小说
     * @param option 
     * @returns 
     */
  async followLatestNovel(p = 1, mode: Mode = 'all', lang: Lang = 'zh'): Promise<Body> {
    return await service.get('follow_latest/novel', {
      params: {
        p, mode, lang
      }
    })
  }
  /**
     * 用户信息
     * @param option 
     * @returns 
     */
  async userExtra(is_smartphone = 0, lang: Lang = 'zh'): Promise<userExtraResult> {
    return await service.get('user/extra', {
      params: {
        is_smartphone, lang
      }
    })
  }
  /**
     * 图片详细信息
     * @param userId 
     * @param ids 
     * @param work_category 
     * @param is_first_page 
     * @param lang 
     * @returns 
     */
  async getImgInfo(userId: string, ids: string[], work_category = 'illustManga', is_first_page = 1, lang: Lang = 'zh'): Promise<ImgInfos> {
    return await service.get(`user/${userId}/profile/illusts`, {
      params: {
        ids, work_category, is_first_page, lang
      }
    })
  }

  /**
     * 图片列表包含的所有 tag
     * @param userId 
     * @param ids 
     * @param work_category 
     * @param is_first_page 
     * @param lang 
     * @returns 
     */
  async getImgTagInfo(ids: string[], lang: Lang = 'zh'): Promise<ImgTag[]> {
    return await service.get('tags/frequent/illust', {
      params: {
        ids, lang
      }
    })
  }
  // 下载图片
  async download(img_info: PhoneImgDownloadInfo) {
    const contentStr = JSON.stringify(img_info.illust_details)
    const date = new Date(img_info.illust_details.reupload_timestamp ? img_info.illust_details.reupload_timestamp * 1000 : img_info.illust_details.upload_timestamp * 1000)
    if (Number(img_info.illust_details.page_count) === 1) {
      const count = selectImgByUrl.get(img_info.illust_details.url_big) as { count: number }
      // const fileName = this.getfileName(img_info.author_details.user_name, img_info.illust_details.title, img_info.illust_details.id, date)
      const fileName = this.getfileName(img_info.illust_details.author_details.user_name, img_info.illust_details.title, img_info.illust_details.id, date)
      const flag = await Bun.file(fileName).exists()
      if (flag) {
        if (count.count === 0) {
          insertImg.run(img_info.illust_details.id, contentStr, img_info.illust_details.url_big)
        }
        return
      }
      await util.download(fileName, img_info.illust_details.url_big, img_info.illust_details.meta.twitter_card.description,
        translationTag(img_info.illust_details.tags, img_info.illust_details.display_tags), img_info.illust_details.id, contentStr)
      insertImg.run(img_info.illust_details.id, contentStr, img_info.illust_details.url_big)
      return
    }
    const imgInfos = img_info.illust_details.manga_a
    let current = 0
    while (current < imgInfos.length) {
      const arr=imgInfos.slice(current, current + 4)
      const promise=[]
      for  (const url of  arr) {
        promise.push(this.getPromiseDownload(url,img_info,contentStr,date))
      }
      await Promise.all(promise)
      const url=arr.filter(v=>v.page===0)
      if(url.length){
        insertImg.run(img_info.illust_details.id, url[0].page === 0 ? contentStr : '', url[0].url_big)
      }
      current += 4
    }
  }

  private async getPromiseDownload(url:Mangaa,img_info:PhoneImgDownloadInfo,contentStr:string,date:Date){
    if (!url) {
      return
    }
    const count = selectImgByUrl.get(url.url_big) as { count: number }
    const fileName = this.getFileNameDoc(img_info.illust_details.author_details.user_name, img_info.illust_details.title, img_info.illust_details.id, date, url.page)
    const flag = await Bun.file(fileName).exists()
    if (flag) {
      if (count.count === 0) {
        insertImg.run(img_info.illust_details.id, url.page === 0 ? contentStr : '', url.url_big)
      }
      return
    }
    return util.download(fileName, url.url_big, img_info.illust_details.meta.twitter_card.description,
      translationTag(img_info.illust_details.tags, img_info.illust_details.display_tags), img_info.illust_details.id, contentStr)
  }

  private getfileName(userName: string, title: string, imgId: string, date: Date) {
    return process.env.DOWNLOADLOCATION + `${userName}/${title}-${date.getFullYear()}-${date.getMonth()}-${date.getDay()}--${imgId}.jpeg`
  }
  private getFileNameDoc(userName: string, title: string, imgId: string, date: Date, page: number) {
    let docName = process.env.DOWNLOADLOCATION + `${userName ? userName : 'unkown'}/`
    docName += `${title ? title : 'unkown'}/`
    return docName + `${title ? title : 'unkown'}}-${date.getFullYear()}-${date.getMonth()}-${date.getDay()}--${imgId}-P${page}.jpeg`
  }

  // 由于图片的描述在 pc 不能直接获得,需要使用手机的api
  // 代替 getImgTagInfo getImgInfo 需要挨个图片查询 能获得下载链接
  // 获得单独图片的信息 touch/ajax/illust/details?illust_id=121695164&ref=&lang=zh
  async getImgTagInfo_Tag_Info_DownloadInfo(illust_id: string, ref = '', lang: Lang = 'zh'): Promise<PhoneImgDownloadInfo> {
    return await phoneService.get('touch/ajax/illust/details', {
      params: {
        illust_id, ref, lang
      }
    })
  }
}




export default new Pixiv()
import type { Lang, Mode, userExtraResult, Body, CanSendResult } from "types/pixiv"
import type { UserProfileAllResult } from "types/pixiv_profile_all"
import { http, downloadImg } from "./axios"
import type { UserLatestResult } from "types/user_latest"
import type { ImgDownloadInfo } from "types/img_download_info"
import type { ImgInfo, ImgInfos } from "types/img_info"
import type { FollowUserInfo } from "types/follow_user_info"
const service = http()

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
    /**
     * 获得关注列表
     * @param userId 
     * @param offset 
     * @param limit 
     * @param rest 
     * @param tag 
     * @param acceptingRequests 是否接稿件
     * @param lang 
     * @returns 
     */
    async getFollowPageInfo(userId: string, offset = 0, limit = 24, rest = "show", tag = [], acceptingRequests = 0, lang: Lang = 'zh'): Promise<FollowUserInfo> {
        return await service.get(`user/${userId}/following`, {
            params: { offset, limit, rest, tag, acceptingRequests, lang }
        })
    }
    /**
     * 最新图片
     */
    async followLatestIllust(p = 1, mode: Mode = 'all', lang: Lang = 'zh'): Promise<Body> {
        return await service.get("follow_latest/illust", {
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
        return await service.get("follow_latest/novel", {
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
        return await service.get("user/extra", {
            params: {
                is_smartphone, lang
            }
        })
    }

    async getImgInfo(userId: string, ids: string[], work_category = "illustManga", is_first_page = 1, lang: Lang = 'zh'): Promise<ImgInfos> {
        return await service.get(`user/${userId}/profile/illusts`, {
            params: {
                ids, work_category, is_first_page, lang
            }
        })
    }
    // 下载图片
    async download(url: string, filename: string, img_info: ImgInfo) {
        return await downloadImg().get(url, {
            responseType: 'arraybuffer'
        }).then(async v => {
            return await Bun.write(Bun.file(process.env.DOWNLOADLOCATION + `${img_info.userName}/${img_info.title}.jpeg`), v.data);
        })
    }
}

export default new Pixiv()
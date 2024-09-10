import chalk from "chalk";
import cookie from "./cookie";
import pixiv_api from "./pixiv_api";
import term from "./term";
import util from "./util";
import { insertFollowUserAndGetNotFinish, selectFollowUser, updateFollowUser } from "./sqlite";

// 获得用户
term.spinner("正在获取用户信息\n")
let needDownloadUser = selectFollowUser.all() as { user_name: string, user_id: string, user_comment: string, finish: boolean }[]
if (needDownloadUser.length === 0) {
    let user = await pixiv_api.getFollowPageInfoAll(cookie.userId)
    needDownloadUser = insertFollowUserAndGetNotFinish(user).map(v => {
        return {
            user_name: v.userName,
            user_id: v.userId,
            user_comment: "",
            finish: false
        }
    })
}
needDownloadUser = needDownloadUser.filter(v => !v.finish)
term.spinner(`需要下载 ${chalk.red(needDownloadUser.length)} 个用户\n`)
let flag = await term.inputBool("开始下载")
if (!flag) {
    process.exit()
}
// 如果 needDownloadUser 为空,只去最新的图片去下载 followLatestIllust
if (needDownloadUser.length === 0) {
    term.writeLine("下载最新图片\n")
    let imgs = await pixiv_api.followLatestIllust()
    for (const imgid of imgs.page.ids) {
        // todo 如果ID重复 跳过查询
        let info = await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo(String(imgid))
        await pixiv_api.download(info)
    }
} else {
    let spinnerUser = term.spinnerEq("spinnerPrefix")
    for (const u of needDownloadUser) {
        spinnerUser(needDownloadUser.length)
        let imgAll = await util.getUserImgAllByPhone(u.user_id)
        if (imgAll.length === 0) {
            continue
        }
        let spinnerImg = term.spinnerEq("spinnerSuffix")
        term.spinner(`用户 ${u.user_name} 总计 ${imgAll.length} 开始下载\n`)
        spinnerImg = term.spinnerEq("spinnerSuffix")
        for (const info of imgAll) {
            spinnerImg(imgAll.length)
            await pixiv_api.download(info)
        }
        updateFollowUser.run(u.user_id)
    }
}
term.closeSpinner()
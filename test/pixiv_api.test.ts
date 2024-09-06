import term from "src/term";
import pixiv_api from "../src/pixiv_api";
import { expect, test, describe, afterAll } from "bun:test";
describe("pixiv_api.ts test", () => {
    test("userExtra", async () => {
        const extra = await pixiv_api.userExtra()
        expect(extra.following).toBeGreaterThan(500)
        expect(extra.mypixivCount).toEqual(0)
    })
    test("followLatestNovel", async () => {
        const lastNovel = await pixiv_api.followLatestNovel()
        expect(lastNovel.page.ids.length).toBeGreaterThan(0)
        expect(lastNovel.thumbnails.novel.length).toBeGreaterThan(0)
        expect(lastNovel.thumbnails.novel.length).toBe(60)
        expect(lastNovel.thumbnails.novel[0].id.length).toBeGreaterThan(0)
    })
    test("followLatestIllust", async () => {
        const lastIllust = await pixiv_api.followLatestIllust()
        expect(lastIllust.page.ids.length).toBeGreaterThan(0)
        expect(lastIllust.thumbnails.illust.length).toBe(60)
        expect(lastIllust.thumbnails.novel.length).toBe(0)
        expect(lastIllust.thumbnails.illust[0].id.length).toBeGreaterThan(0)
    })
    // 获得用户插画和小说 95799131 为例 url: https://www.pixiv.net/users/95799131
    let userId = 95799131
    test("getUserProfileAll", async () => {
        const all = await pixiv_api.getUserProfileAll(String(userId))
        expect(Object.keys(all.illusts).length).toBeGreaterThan(300)
        expect(Object.keys(all.novels)).toContain("22840430")
    })
    test("getFollowPageInfo", async () => {
        const all = await pixiv_api.getFollowPageInfo(String(userId))
        expect(all.total).toBeGreaterThan(20)
        expect(all.total).toBeLessThan(30)
        expect(all.extraData.meta.title).toEqual("日向的关注 - pixiv")
    })
    test("getImgDownloadInfo", async () => {
        const all = await pixiv_api.getUserProfileAll(String(userId))
        const imgDownloadInfo = await pixiv_api.getImgDownloadInfo(Object.keys(all.illusts)[0])
        expect(imgDownloadInfo.length).toBeGreaterThan(0)
        expect(imgDownloadInfo[0].urls.original).toBeString()
        let imgInfos = await pixiv_api.getImgInfo(String(userId), [Object.keys(all.illusts)[0]])
        let img_info = Object.values(imgInfos.works)[0]
        let size = await pixiv_api.download(imgDownloadInfo[0].urls.original, img_info.title || img_info.id, img_info)
        expect(size).toBeGreaterThan(0)
        expect(await Bun.file(process.env.DOWNLOADLOCATION + `${img_info.userName}/${img_info.title}.jpeg`).exists()).toBeTrue()
    })
})
afterAll(() => {
    term.closeSpinner()
})



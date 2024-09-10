import term from "src/term";
import pixiv_api from "../src/pixiv_api";
import { expect, test, describe, afterAll } from "bun:test";

describe("phone api test", () => {
    test("getImgTagInfo_Tag_Info_DownloadInfo", async () => {
        let info = await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo("105669242")
        expect(info.illust_details.page_count).toEqual("30")
        expect(info.illust_details.meta.twitter_card.description).toEqual("欢迎私信互动")
    }, 10000)
})

describe("pixiv_api.ts test", () => {
    test("userExtra", async () => {
        const extra = await pixiv_api.userExtra()
        expect(extra.following).toBeGreaterThan(500)
        expect(extra.mypixivCount).toEqual(0)
    }, 10000)
    test("followLatestNovel", async () => {
        const lastNovel = await pixiv_api.followLatestNovel()
        expect(lastNovel.page.ids.length).toBeGreaterThan(0)
        expect(lastNovel.thumbnails.novel.length).toBeGreaterThan(0)
        expect(lastNovel.thumbnails.novel.length).toBe(60)
        expect(lastNovel.thumbnails.novel[0].id.length).toBeGreaterThan(0)
    }, 10000)
    test("followLatestIllust", async () => {
        const lastIllust = await pixiv_api.followLatestIllust()
        expect(lastIllust.page.ids.length).toBeGreaterThan(0)
        expect(lastIllust.thumbnails.illust.length).toBe(60)
        expect(lastIllust.thumbnails.novel.length).toBe(0)
        expect(lastIllust.thumbnails.illust[0].id.length).toBeGreaterThan(0)
    }, 10000)
    // 获得用户插画和小说 95799131 为例 url: https://www.pixiv.net/users/95799131
    let userId = 95799131
    test("getUserProfileAll", async () => {
        const all = await pixiv_api.getUserProfileAll(String(userId))
        expect(Object.keys(all.illusts).length).toBeGreaterThan(300)
        expect(Object.keys(all.novels)).toContain("22840430")
    }, 10000)
    test("getFollowPageInfo", async () => {
        const all = await pixiv_api.getFollowPageInfo(String(userId))
        expect(all.total).toBeGreaterThan(20)
        expect(all.total).toBeLessThan(30)
        expect(all.extraData.meta.title).toEqual("日向的关注 - pixiv")
    }, 10000)
    test("getFollowPageInfo self", async () => {
        let cookie = require("../src/cookie");
        const followUser = await pixiv_api.getFollowPageInfo(String(cookie.default.userId))
        expect(followUser.total).toBeGreaterThanOrEqual(500)
        expect(followUser.users.length).toEqual(24)
        expect(followUser.extraData.meta.title).toEqual("abliger的关注 - pixiv")
    }, 10000)
    test("getFollowPageInfo page more", async () => {
        let cookie = require("../src/cookie");
        const followUser = await pixiv_api.getFollowPageInfo(String(cookie.default.userId), 900)
        expect(followUser.total).toBeGreaterThanOrEqual(500)
        expect(followUser.users.length).toEqual(0)
        expect(followUser.extraData.meta.title).toEqual("abliger的关注 - pixiv")
    }, 10000)
    test("getFollowPageInfoAll", async () => {
        const all = await pixiv_api.getFollowPageInfoAll(cookie.userId)
        expect(all.length).toBeGreaterThan(400)
    }, 10000)
    test("getImgDownloadInfo", async () => {
        const all = await pixiv_api.getUserProfileAll(String(userId))
        const imgDownloadInfo = await pixiv_api.getImgDownloadInfo(Object.keys(all.illusts)[0])
        expect(imgDownloadInfo.length).toBeGreaterThan(0)
        expect(imgDownloadInfo[0].urls.original).toBeString()
        // let imgInfos = await pixiv_api.getImgInfo(String(userId), [Object.keys(all.illusts)[0]])
        // let img_info = Object.values(imgInfos.works)[0]
        // let size = await pixiv_api.download(img_infos.[0])
        // expect(size).toBeGreaterThan(0)
        // expect(await Bun.file(process.env.DOWNLOADLOCATION + `temp/${img_info.userName}/${img_info.title}.jpeg`).exists()).toBeTrue()
    }, 10000)
})

import { rmdir } from "node:fs/promises";
import cookie from "src/cookie";

afterAll(async () => {
    term.closeSpinner()
    let size = await Bun.file(process.env.DOWNLOADLOCATION + `temp/`).size
    if (!size) {
        rmdir(process.env.DOWNLOADLOCATION + `temp/`)
    }
})



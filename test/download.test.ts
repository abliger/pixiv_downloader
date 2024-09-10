import pixiv_api from '../src/pixiv_api'
import { test, describe } from 'bun:test'

describe('download img test', () => {
  test('download', async() => {
    let info = await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo('121695164')
    await pixiv_api.download(info)
    info = await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo('121766893')
    await pixiv_api.download(info)
    info = await pixiv_api.getImgTagInfo_Tag_Info_DownloadInfo('121565992')
    await pixiv_api.download(info)
  }, 30000)
}) 
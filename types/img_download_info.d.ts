interface Urls {
    thumb_mini: string
    small: string
    regular: string
    original: string
}

export interface ImgDownloadInfo {
    urls: Urls
    width: number
    height: number
}
interface TitleCaptionTranslation {
    workTitle: null
    workCaption: null
}

interface Cotent {
    id: string
    title: string
    genre: string
    xRestrict: number
    restrict: number
    url: string
    tags: Array<string>
    userId: string
    userName: string
    profileImageUrl: string
    textCount: number
    wordCount: number
    readingTime: number
    useWordCount: boolean
    description: string
    isBookmarkable: boolean
    bookmarkData: null
    bookmarkCount: number
    isOriginal: boolean
    marker: null
    titleCaptionTranslation: TitleCaptionTranslation$1Type
    createDate: string
    updateDate: string
    isMasked: boolean
    aiType: number
    isUnlisted: boolean
}

type Novels = Record<string, Cotent>

export interface UserLatestResult {
    illusts: Array<unknown>
    novels: Novels
}


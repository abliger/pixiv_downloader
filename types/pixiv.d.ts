
export interface userExtraResult {
    following: number
    followers: number
    mypixivCount: number
    background?: any
}
export interface CanSendResult {
    can_send: boolean
}

export declare type Lang = 'zh' | string
export declare type Mode = "all" | "r18"
export interface Page {
    ids: number[];
    isLastPage: boolean;
    tags: any[];
}

export interface TitleCaptionTranslation {
    workTitle?: any;
    workCaption?: any;
}

export interface Novel {
    id: string;
    title: string;
    genre: string;
    xRestrict: number;
    restrict: number;
    url: string;
    tags: string[];
    userId: string;
    userName: string;
    profileImageUrl: string;
    textCount: number;
    wordCount: number;
    readingTime: number;
    useWordCount: boolean;
    description: string;
    isBookmarkable: boolean;
    bookmarkData?: any;
    bookmarkCount: number;
    isOriginal: boolean;
    marker?: any;
    titleCaptionTranslation: TitleCaptionTranslation;
    createDate: string;
    updateDate: string;
    isMasked: boolean;
    aiType: number;
    isUnlisted: boolean;
}

export interface Thumbnail {
    illust: Illust[];
    novel: Novel[];
    novelSeries: any[];
    novelDraft: any[];
    collection: any[];
}

export interface Body {
    page: Page;
    tagTranslation: { string: i18n }[];
    thumbnails: Thumbnail;
    illustSeries: any[];
    requests: any[];
    users: any[];
    zoneConfig: ZoneConfig;
}

export interface RootInterface {
    error: boolean;
    message: string;
    body: Body;
}

export interface ZoneConfig {
    header: ZoneConfigUrl;
    footer: ZoneConfigUrl;
    logo: ZoneConfigUrl;
    ad_logo: ZoneConfigUrl;
}

export interface ZoneConfigUrl {
    url: string;
}

export interface Illust {
    id: string;
    title: string;
    illustType: number;
    xRestrict: number;
    restrict: number;
    sl: number;
    url: string;
    description: string;
    tags: string[];
    userId: string;
    userName: string;
    width: number;
    height: number;
    pageCount: number;
    isBookmarkable: boolean;
    bookmarkData?: any;
    alt: string;
    titleCaptionTranslation: TitleCaptionTranslation;
    createDate: string;
    updateDate: string;
    isUnlisted: boolean;
    isMasked: boolean;
    aiType: number;
    urls: Urls;
    profileImageUrl: string;
}

export interface Urls {
    '250x250': string;
    '360x360': string;
    '540x540': string;
    '1200x1200': string;
}

export interface i18n {
    en: string;
    ko: string;
    zh: string;
    zh_tw: string;
    romaji: string;
}
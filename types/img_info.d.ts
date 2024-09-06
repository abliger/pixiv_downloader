export interface ImgInfos {
    works: Works;
    zoneConfig: ZoneConfig;
    extraData: ExtraData;
}

interface ExtraData {
    meta: Meta;
}

interface Meta {
    title: string;
    description: string;
    canonical: string;
    ogp: Ogp;
    twitter: Twitter;
    alternateLanguages: AlternateLanguages;
    descriptionHeader: string;
}

interface AlternateLanguages {
    ja: string;
    en: string;
}

interface Twitter {
    description: string;
    image: string;
    title: string;
    card: string;
}

interface Ogp {
    description: string;
    image: string;
    title: string;
    type: string;
}

interface ZoneConfig {
    header: Header;
    footer: Header;
    '500x500': Header;
    t_responsive_320_50: Header;
    t_responsive_300_250: Header;
    logo: Header;
    ad_logo: Header;
}

interface Header {
    url: string;
}

interface Works {
    [s: string]: ImgInfo
}
export interface ImgInfo {
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
    profileImageUrl: string;
}

interface TitleCaptionTranslation {
    workTitle?: any;
    workCaption?: any;
}
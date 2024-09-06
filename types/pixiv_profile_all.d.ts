export interface UserProfileAllResult {
    illusts: Illusts;
    manga: any[];
    novels: Novels;
    mangaSeries: any[];
    novelSeries: NovelSery[];
    pickup: FreePickup[] | PricePickUp[];
    bookmarkCount: BookmarkCount;
    externalSiteWorksStatus: ExternalSiteWorksStatus;
    request: Request;
}

interface Request {
    showRequestTab: boolean;
    showRequestSentTab: boolean;
    postWorks: PostWorks;
}

interface PostWorks {
    artworks: any[];
    novels: any[];
}

interface ExternalSiteWorksStatus {
    booth: boolean;
    sketch: boolean;
    vroidHub: boolean;
}

interface BookmarkCount {
    public: Public;
    private: Public;
}

interface Public {
    illust: number;
    novel: number;
}

interface FreePickup {
    id: number;
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
    seriesId: string;
    seriesTitle: string;
    isUnlisted: boolean;
    type: string;
    deletable: boolean;
    draggable: boolean;
    contentUrl: string;
}
interface PricePickUp {
    id: number;
    name: string;
    url: string;
    image: string;
    primary_image: Primaryimage;
    variation_types: string[];
    published_at: number;
    price: number;
    price_str: string;
    description: string;
    adult: boolean;
    market_url: string;
    sound?: any;
    category: Category;
    shop: Shop;
    events: any[];
    type: string;
    deletable: boolean;
    draggable: boolean;
    contentUrl: string;
}
interface Shop {
    uuid: string;
    name: string;
    description: string;
    websites: Website[];
    subdomain: string;
    url: string;
    theme: Theme;
    user: User;
}
interface Theme {
    header: Baseresized;
    background: Background;
}
interface Background {
    url?: any;
}
interface Baseresized {
    url: string;
}
interface Website {
    service: string;
    url: string;
}
interface Category {
    name: string;
}
interface Primaryimage {
    url: string;
    base_resized: Baseresized;
    base_square: Baseresized;
    c_72x72: Baseresized;
    c_288x384: Baseresized;
    c_512x683: Baseresized;
    f_150x150: Baseresized;
    c_300: Baseresized;
    f_620: Baseresized;
}

interface TitleCaptionTranslation {
    workTitle?: any;
    workCaption?: any;
}

interface NovelSery {
    id: string;
    userId: string;
    userName: string;
    profileImageUrl: string;
    xRestrict: number;
    isOriginal: boolean;
    isConcluded: boolean;
    genreId: string;
    title: string;
    caption: string;
    language: string;
    tags: string[];
    publishedContentCount: number;
    publishedTotalCharacterCount: number;
    publishedTotalWordCount: number;
    publishedReadingTime: number;
    useWordCount: boolean;
    lastPublishedContentTimestamp: number;
    createdTimestamp: number;
    updatedTimestamp: number;
    createDate: string;
    updateDate: string;
    firstNovelId: string;
    latestNovelId: string;
    displaySeriesContentCount: number;
    shareText: string;
    total: number;
    firstEpisode: FirstEpisode;
    watchCount?: any;
    maxXRestrict?: any;
    cover: Cover;
    coverSettingData?: any;
    isWatched: boolean;
    isNotifying: boolean;
    aiType: number;
}

interface Cover {
    urls: Urls;
}

interface Urls {
    '240mw': string;
    '480mw': string;
    '1200x1200': string;
    '128x128': string;
    original: string;
}

interface FirstEpisode {
    url: string;
}

interface Novels {
    string?: any
}

interface Illusts {
    string?: any
}
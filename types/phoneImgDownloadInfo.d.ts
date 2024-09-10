export interface PhoneImgDownloadInfo {
    illust_details: Illustdetails;
    author_details: Authordetails2;
    ads: Ads;
}

export interface Ads {
    ad_below_header: Adbelowheader;
    ad_below_everything: Adbeloweverything;
    ad_above_related_works: Adbeloweverything;
    ad_pager: Adpager;
    ad_overlay: Adbelowheader;
    ad_in_feed: Adbeloweverything;
    ad_grid: Adpager;
    ad_list: Adbeloweverything;
    ad_above_comment: Adbeloweverything;
    logo: Adpager;
    ad_logo: Adpager;
}

export interface Adpager {
    url: string;
    zone: string;
    ng: string;
    height: number;
    width: number;
    geta: boolean;
}

export interface Adbeloweverything {
    url: string;
    zone: string;
    ng: string;
    height: string;
    width: string;
    geta: boolean;
}

export interface Adbelowheader {
    url: string;
    zone: string;
    ng: string;
    height: string;
    width: number;
    geta: boolean;
}

export interface Authordetails2 {
    user_id: string;
    user_status: string;
    user_account: string;
    user_name: string;
    user_premium: string;
    profile_img: Profileimg;
    external_site_works_status: Externalsiteworksstatus;
    is_followed: boolean;
    commission?: any;
}

export interface Externalsiteworksstatus {
    booth: boolean;
    sketch: boolean;
    vroidHub: boolean;
}

export interface Profileimg {
    main: string;
}

export interface Illustdetails {
    url: string;
    tags: string[];
    illust_images: Illustimage[];
    manga_a: Mangaa[];
    display_tags: Displaytag[];
    tags_editable: boolean;
    bookmark_user_total: number;
    url_s: string;
    url_ss: string;
    url_big: string;
    url_placeholder: string;
    ugoira_meta?: any;
    share_text: string;
    request?: any;
    location_mask: boolean;
    meta: Meta;
    is_rated: boolean;
    response_get: any[];
    response_send: any[];
    title_caption_translation: Titlecaptiontranslation;
    is_mypixiv: boolean;
    is_private: boolean;
    is_howto: boolean;
    is_original: boolean;
    alt: string;
    upload_timestamp: number;
    reupload_timestamp: number;
    id: string;
    user_id: string;
    title: string;
    width: string;
    height: string;
    restrict: string;
    x_restrict: string;
    type: string;
    sl: number;
    book_style: string;
    page_count: string;
    comment_off_setting: number;
    ai_type: number;
    comment: string;
    rating_count: string;
    rating_view: string;
    comment_html: string;
    author_details: Authordetails;
}

export interface Authordetails {
    user_id: string;
    user_name: string;
    user_account: string;
}

export interface Titlecaptiontranslation {
    work_title?: any;
    work_caption?: any;
}

export interface Meta {
    twitter_card: Twittercard;
    ogp: Ogp;
    title: string;
    description: string;
    description_header: string;
    canonical: string;
    alternate_languages: Alternatelanguages;
}

export interface Alternatelanguages {
    ja: string;
    en: string;
}

export interface Ogp {
    title: string;
    type: string;
    image: string;
    description: string;
}

export interface Twittercard {
    card: string;
    site: string;
    url: string;
    title: string;
    description: string;
    image: string;
    'app:name:iphone': string;
    'app:id:iphone': string;
    'app:url:iphone': string;
    'app:name:ipad': string;
    'app:id:ipad': string;
    'app:url:ipad': string;
    'app:name:googleplay': string;
    'app:id:googleplay': string;
    'app:url:googleplay': string;
}

export interface Displaytag {
    tag: string;
    is_pixpedia_article_exists: boolean;
    set_by_author: boolean;
    is_locked: boolean;
    is_deletable: boolean;
    translation?: string;
}

export interface Mangaa {
    page: number;
    url: string;
    url_small: string;
    url_big: string;
}

export interface Illustimage {
    illust_image_width: string;
    illust_image_height: string;
}
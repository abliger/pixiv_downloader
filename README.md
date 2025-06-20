# pixiv downloader

## 使用说明

**只在 MAC 平台开发,其他平台均未测试**

> 如果想要保存照片的作者、标签和描述,请先使用下面命令
> 1. `brew install tag` 
> 2. `sudo cp /opt/homebrew/bin/tag /usr/local/bin`

### 注意

使用前添加  `.env` 文件

如果想要自动登录按下面内容填写

```text
DOWNLOADLOCATION=*** # 下载位置
USERNAME=*** # 用户
PASSWORD=*** # 密码
```

如果自动登录有问题尝试获取 cookies 填写下面内容

```text
DOWNLOADLOCATION=*** # 下载位置
COOKIES=*** # 注意需要 json 化
ACCOUNTID=***
```

分别填入用户名,密码,下载位置

### QA

#### 报找不对应版本的chorme

运行 `pnpx puppeteer browsers install chrome`



### 效果

![效果图](.md/iShot_2024-09-11_19.19.42.png)
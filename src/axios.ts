import axios from 'axios'
// import axiosRetry from 'axios-retry';
import cookie from './cookie'
import { messageLog } from './message_log'

export function http(log = messageLog) {
  function getAuthHeaders() {
    return {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
      Host: 'www.pixiv.net',
      Referer: 'https://www.pixiv.net',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
      Cookie: cookie.cookieArray?.map(t => `${t.name}=${t.value}`).join(';'),
      'x-user-id': cookie.userId,
      'Cache-Control': 'no-cache'
    }
  }
  const service = axios.create({
    baseURL: 'https://www.pixiv.net/ajax/',
    proxy: {
      host: '127.0.0.1',
      port: 7890,
      protocol: 'http'
    },
    headers: getAuthHeaders(),
    timeout: 10000,
  })

  service.interceptors.response.use(
    (value) => {
      if (value.data.error) {
        log(value.data)
        cookie.fetchAndSaveCookies()
        // return Promise.reject(value.data.message)
      }
      return value.data.body
    },
    (error) => {
      log(error)
      return Promise.resolve()
    }
  )

  // axiosRetry(service, {
  //     retries: 1, // 最大重试次数
  //     retryDelay: (retryCount) => {
  //         // 重试延迟，可以是个函数，以生成动态延迟
  //         return retryCount * 5000; // 例如指数退避
  //     },
  // })
  return service
}
export function downloadImg(log  = messageLog) {
  const img = axios.create({
    proxy: {
      host: '127.0.0.1',
      port: 7890,
      protocol: 'http'
    },
    headers: {
      Referer: 'https://www.pixiv.net'
    }
  })
  img.interceptors.response.use(null,
    (error) => {
      log(error)
      return Promise.resolve()
    }
  )
  return img
}
export function phoneHttp(log  = messageLog) {
  function getAuthHeaders() {
    return {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
      Host: 'www.pixiv.net',
      Referer: 'https://www.pixiv.net',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      Cookie: cookie.cookieArray?.map(t => `${t.name}=${t.value}`).join(';'),
      'x-user-id': cookie.userId,
      'Cache-Control': 'no-cache'
    }
  }
  const service = axios.create({
    baseURL: 'https://www.pixiv.net/',
    proxy: {
      host: '127.0.0.1',
      port: 7890,
      protocol: 'http'
    },
    headers: getAuthHeaders(),
  })
  service.interceptors.response.use(
    (value) => {
      if (value.data.error) {
        log(value.data)
        cookie.fetchAndSaveCookies()
        // return Promise.reject(value.data.message)
      }
      return value.data.body
    },
    (error) => {
      log(error)
      return Promise.resolve()
    }
  )

  // axiosRetry(service, {
  //     retries: 1, // 最大重试次数
  //     retryDelay: (retryCount) => {
  //         // 重试延迟，可以是个函数，以生成动态延迟
  //         return retryCount * 5000; // 例如指数退避
  //     },
  // })
  return service
}
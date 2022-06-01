import { useEffect, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import KeepAlive, { AliveScope, useAliveController, useActivate } from 'react-activation'
import { treeToList } from './utils'

let allFlatRoutes = []
let keepAliveRoutes = []
let HISTORY_UNLISTEN = null

// 初始化 allFlatRoutes keepAliveRoutes
function initRoutes(routes) {
  allFlatRoutes = treeToList(routes) // 所有路由
  keepAliveRoutes = allFlatRoutes.filter((item) => item.meta?.keepAlive) // keepAlive的路由
}

// 判断props.children是否需要被 <KeepAlive> 包裹
function KeepAliveWrapper(props) {
  const location = useLocation()
  const curPath = location.pathname
  const routeItem = keepAliveRoutes.find((item) => item.path == curPath)

  let dom = props.children
  if (routeItem) {
    dom = (
      <KeepAlive
        id={curPath} // id 用于多个keepAlive // id 一定要加 否则 keepAlive的页面 跳转 另一个keepAlive的页面 会有问题
        name={curPath} // name 用于手动控制缓存
      >
        {props.children}
      </KeepAlive>
    )
  }
  return dom
}

// 监听路由 手动控制 keepAlive缓存
function useKeepAlive() {
  const location = useLocation()
  const history = useHistory()
  const aliveController = useAliveController()

  const fromPathRef = useRef('') // 记录fromPath

  useEffect(() => {
    fromPathRef.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    HISTORY_UNLISTEN = history.listen((to, type) => {
      const fromPath = fromPathRef.current
      const toPath = to.pathname
      console.log('fromPath 当前页面', fromPath)
      console.log('toPath', toPath)

      const routeItem = keepAliveRoutes.find((item) => item.path == fromPath) // from页面 是一个需要keepAlive的页面
      const curPathIsKeepAliveToPath = keepAliveRoutes.find((item) => item.meta?.keepAlive?.toPath == fromPath) // from页面 是一个 需要keepAlive的页面的toPath

      // 控制keepAlive缓存

      if (routeItem) {
        console.log('from页面 是一个需要keepAlive的页面')
        if (toPath == routeItem.meta?.keepAlive.toPath) {
          console.log('toPath 正好是当前这个路由的 keepAlive.toPath')
        } else {
          console.log('toPath 不是当前这个路由的 keepAlive.toPath，清除')
          aliveController?.dropScope && aliveController.dropScope(fromPath)
        }
      }

      if (curPathIsKeepAliveToPath) {
        console.log('from页面 是某个keepAlive的页面 的toPath')
        const nextRouteItem = allFlatRoutes.find((item) => item.path == toPath) // 要去的页面的 route
        if (nextRouteItem?.meta?.keepAlive?.toPath == fromPath) {
          console.log('所去的 页面是 parentItem.path，不做什么')
        } else {
          console.log('清除 parentItem.path keepAlive')
          try {
            aliveController?.dropScope && aliveController.dropScope(nextRouteItem?.path)
          } catch (e) {
            console.log(e)
          }
        }
      }
    })
    return () => {
      HISTORY_UNLISTEN && HISTORY_UNLISTEN()
    }
  }, [])
}

/**
 *
 * activate 传参
 */

const KEEP_ALIVE_OPTIONS_KEY = (key) => {
  return window.location.origin + '_KEEP_ALIVE_OPTIONS_KEY_' + key
}

// 页面activate的时候触发 一般就是从detail页返回
function useActivateWithOptions(activatePageKey, callback) {
  useActivate(() => {
    let options = {}
    try {
      let optionsJsonStr = localStorage.getItem(KEEP_ALIVE_OPTIONS_KEY(activatePageKey))
      const obj = JSON.parse(optionsJsonStr)
      if (Object.prototype.toString.call(obj) === '[object Object]') {
        options = obj
      }
    } catch {}
    localStorage.removeItem(KEEP_ALIVE_OPTIONS_KEY(activatePageKey))

    callback && callback(options)
  })
}

function setActivateOptions(activatePageKey, options = {}) {
  const optionsJsonStr = JSON.stringify(options)
  localStorage.setItem(KEEP_ALIVE_OPTIONS_KEY(activatePageKey), optionsJsonStr)
}

export {
  initRoutes,
  AliveScope,
  KeepAliveWrapper,
  useKeepAlive,
  //
  useActivateWithOptions as useActivate,
  setActivateOptions,
}

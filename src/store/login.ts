import { makeAutoObservable, runInAction } from 'mobx'
import request from '@/utils/request'
import dealMenu from '@/utils/dealMenu'
import { LOGIN_TOKEN_KEY } from '@/utils/consts'

class Login {
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }
  userInfo: object | null = null
  allMenu: MenuItemType[] = []
  menuTree: MenuItemType[] = []
  rightsArr: MenuItemType[] = []

  loading = {
    getMenuTree: false,
  }

  async initInfo() {
    this.getUserInfo()
    this.getMenuTree()
  }
  async getUserInfo() {
    const data = await request<object | null>({
      url: '/web/getLoginStaffInfo',
    })
    if (data) {
      runInAction(() => {
        this.userInfo = data
      })
    }
  }
  async getMenuTree() {
    this.loading.getMenuTree = true
    const data = await request<MenuType[]>({
      url: '/web/menu/getAllMenuList',
    })
    runInAction(() => {
      this.loading.getMenuTree = false

      const menuRes = dealMenu(data)
      this.allMenu = menuRes.allMenu ?? []
      this.menuTree = menuRes.menuTree ?? []
      this.rightsArr = menuRes.rightsArr ?? []
    })
  }
  logout() {
    localStorage.removeItem(LOGIN_TOKEN_KEY)

    this.userInfo = null
    this.allMenu = []
    this.menuTree = []
    this.rightsArr = []
  }
}
const login = new Login()
export default login

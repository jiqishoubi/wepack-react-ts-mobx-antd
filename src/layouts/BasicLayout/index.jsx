import { Outlet } from 'react-router-dom'
import { observer } from 'mobx-react'
import login from '@/store/login'
import ContentLayout from '@/components/layout/ContentLayout'
import HeaderAccount from '@/components/HeaderAccount'
import styles from './index.less'

function Index() {
  return (
    <ContentLayout
      // header
      renderHeaderLeft={() => {
        return 'header-left'
      }}
      renderHeaderRight={<HeaderAccount />}
      // sideMenu
      renderLogo={() => {
        return <div>side-logo</div>
      }}
      allMenu={login.allMenu}
      menuTree={login.menuTree}
      menuValueKey="menuCode" // 作为唯一key
      sideMenuShowSearch={true}
    >
      <div className={styles.main_wrap}>
        <Outlet />
      </div>
    </ContentLayout>
  )
}

export default observer(Index)

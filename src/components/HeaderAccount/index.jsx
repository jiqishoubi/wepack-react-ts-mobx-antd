import { observer } from 'mobx-react'
import login from '@/store/login'
import { useNavigate } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import styles from './index.less'
import { showConfirm } from '@/utils/confirm'
import { LOGIN_PATH } from '@/utils/consts'
export default observer(function HeaderAccount() {
  const navigate = useNavigate()
  const { userInfo } = login
  function handleLogout() {
    showConfirm('确定注销账户？', () => {
      login.logout()
      navigate(LOGIN_PATH)
    })
  }
  return (
    <div className={styles.account_wrap}>
      {userInfo?.loginName}
      {userInfo?.realName && <span>（{userInfo?.realName}）</span>}
      {/* 注销按钮 */}
      {userInfo && (
        <div className={styles.logout_btn} onClick={handleLogout}>
          <LogoutOutlined style={{ fontSize: 17, color: 'red' }} />
        </div>
      )}
    </div>
  )
})

import { Message, MessageBox } from 'element-ui'
import util from '@/libs/util.js'
import { AccountLogin, GetAdminInfo } from '@api/sys.login'
import router from '@/router'
import manageModules from '@/menu/modules/manageModules.js'
export default {
  namespaced: true,
  actions: {
    /**
     * @description 登录
     * @param {Object} context
     * @param {Object} payload username {String} 用户账号
     * @param {Object} payload password {String} 密码
     * @param {Object} payload route {Object} 登录成功后定向的路由对象 任何 vue-router 支持的格式
     */
    login({ dispatch }, {
      adminName = '',
      adminPassword = ''
    } = {}) {
      return new Promise((resolve, reject) => {
        // 开始请求登录接口
        AccountLogin({
          adminName,
          adminPassword
        })
          .then(async res => {
            // 设置 cookie 一定要存 uuid 和 token 两个 cookie
            // 整个系统依赖这两个数据进行校验和存储
            // uuid 是用户身份唯一标识 用户注册的时候确定 并且不可改变 不可重复
            // token 代表用户当前登录状态 建议在网络请求中携带 token
            // 如有必要 token 需要定时更新，默认保存一天
            console.log(res);
            util.cookies.set('uuid', res.id)
            util.cookies.set('token', res.id)
            GetAdminInfo(res.id).then(async res => {
              console.log(res);
              // 设置 vuex 用户信息
              await dispatch('d2admin/user/set', {
                name: res.adminName,
              }, { root: true })
              // 用户登录后从持久化数据加载一系列的设置
              await dispatch('load')
              // 结束
              resolve(res)
            })
          })
          .catch(err => {
            console.log('err: ', err)
            reject(err)
          })
      })
    },
    /**
     * @description 注销用户并返回登录页面
     * 注销之后对侧边栏功能进行初始化
     * @param {Object} context
     * @param {Object} payload confirm {Boolean} 是否需要确认
     */
    logout({ commit, dispatch }, { confirm = false } = {}) {
      /**
       * @description 注销
       */
      async function logout() {
        manageModules.children = (pre => [
          { path: `${pre}index`, title: '管理员首页', icon: 'home' },
          {
            path: `${pre}report`,
            title: '举报',
            icon: 'cubes',
            children: [
              { path: `${pre}userReport`, title: '用户举报' },
              { path: `${pre}newsReport`, title: '新闻举报' },
            ]
          },
          {
            path: `${pre}apply`,
            title: '申请',
            icon: 'cubes',
            children: [
              { path: `${pre}userVerified`, title: '用户实名认证' },
              { path: `${pre}newsApply`, title: '新闻发布申请' },
            ]
          },
          {
            path: `${pre}manage`,
            title: '管理',
            icon: 'cubes',
            children: [
              { path: `${pre}userManage`, title: '用户管理' },
              { path: `${pre}newsManage`, title: '新闻管理' },
            ]
          },
          {
            path: `${pre}newsMakerManage`,
            title: '新闻发布者管理',
            icon: 'cubes',
            children: [
              { path: `${pre}userApplyToNewsMaker`, title: '新闻发布者申请' },
              { path: `${pre}newsMakerManage`, title: '管理新闻发布者' },
            ]
          },
          {
            path: `${pre}superManage`,
            title: '超级管理员',
            icon: 'cubes',
            children: [
              { path: `${pre}manageManage`, title: '管理管理员' },
              { path: `${pre}logLook`, title: '日志查看' },
            ]
          }
        ])('/manage/')
        // 删除cookie
        util.cookies.remove('token')
        util.cookies.remove('uuid')
        // 清空 vuex 用户信息
        await dispatch('d2admin/user/set', {}, { root: true })
        console.log(manageModules.children);
        // 跳转路由
        router.push({
          name: 'login'
        })
      }
      // 判断是否需要确认
      if (confirm) {
        commit('d2admin/gray/set', true, { root: true })
        MessageBox.confirm('确定要注销当前用户吗', '注销用户', {
          type: 'warning'
        })
          .then(() => {
            commit('d2admin/gray/set', false, { root: true })
            logout()
          })
          .catch(() => {
            commit('d2admin/gray/set', false, { root: true })
            Message({
              message: '取消注销操作'
            })
          })
      } else {
        logout()
      }
    },
    /**
     * @description 用户登录后从持久化数据加载一系列的设置
     * @param {Object} context
     */
    load({ dispatch }) {
      return new Promise(async resolve => {
        // DB -> store 加载用户名
        await dispatch('d2admin/user/load', null, { root: true })
        // DB -> store 加载主题
        await dispatch('d2admin/theme/load', null, { root: true })
        // DB -> store 加载页面过渡效果设置
        await dispatch('d2admin/transition/load', null, { root: true })
        // DB -> store 持久化数据加载上次退出时的多页列表
        await dispatch('d2admin/page/openedLoad', null, { root: true })
        // DB -> store 持久化数据加载侧边栏折叠状态
        await dispatch('d2admin/menu/asideCollapseLoad', null, { root: true })
        // DB -> store 持久化数据加载全局尺寸
        await dispatch('d2admin/size/load', null, { root: true })
        // DB -> store 持久化数据加载颜色设置
        await dispatch('d2admin/color/load', null, { root: true })
        // end
        resolve()
      })
    }
  }
}

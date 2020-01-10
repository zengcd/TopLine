import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '@/views/login'
import Home from '@/views/home'

Vue.use(VueRouter)

const routes = [
  // {path:'/login',component:function(){return import('×××')}}
  // { path: './login', component:箭头函数}
  // import使用：
  // 1.import ××× from ×××; 模块化导入  //完成导入
  // 2.import(×××) 函数调用 //按需导入
  // 本质不是一回事----函数调用：访问就会导入---模块化导入：用不用都会导入
  // 如下是import()函数调用，好处是按需导入，节省资源

  // @符号代表src目录的绝对路径名地址
  // '@/views/login/index.vue'----index.vue是默认索引文件，不用设置，自动会寻找，代码更节省，更优雅-----只有index.vue会默认被寻找
  // name属性作用，编程式导航可以被使用
  { path: '/login', name: 'login', component: Login },
  {
    path: '/home',
    name: 'home',
    component: Home,
    redirect: './welcome',
    children: [
      { path: '/welcome', name: 'welcome', component: () => import('@/views/welcome') },
      { path: '/article', name: 'article', component: () => import('@/views/article') }
    ] }]
// import 函数需要相关的依赖包支持

const router = new VueRouter({
  routes
})

// 配置全局前置路由守卫
router.beforeEach((to, from, next) => {
  // 获得用户登录状态信息
  let userinfo = window.sessionStorage.getItem('userinfo')
  // 登录状态：useinfo是大字符串，非登录状态：userinfo为null
  if (!userinfo && to.path !== '/login') {
    // 强制登录
    return next('./login')
  }

  // 放行
  next()
})
export default router

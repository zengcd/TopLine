import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 引入全局初始化样式文件
import '@/assets/css/global.css'

// 导入elementui模块
import ElementUI from 'element-ui'

// 导入axios相关代码
import '@/utils/ax.js'

Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

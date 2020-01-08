<template>
    <div class="login-container"> <!--大盒子-->
      <div class="login-box">     <!--大盒子-->
        <!-- 绘制登录form表单 -->
         <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
           <img src="./logo_index.png" alt=''>

           <!-- 可以找到当前目标进行匹配校验，值 就是当前项目的名称 -->
          <el-form-item prop="mobile">
            <el-input v-model="loginForm.mobile" placeholder="请输入手机号码"></el-input>
          </el-form-item>
          <el-form-item prop='code'>
            <el-input v-model="loginForm.code"  placeholder="请输入校验码"></el-input>
          </el-form-item>
          <el-form-item style="text-align:left;" prop="xieyi">
            <el-checkbox v-model="loginForm.xieyi" style="margin-right:10px;"></el-checkbox>
            <span>我已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私条款</a></span>
          </el-form-item>
          <el-form-item>
            <el-button style="width:100%;" type="primary" @click="login()" :disabled='isLoading' :loading='isLoading'>登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
// 导入极验的gt.js文件(gt.js文件本身没有做模块化导出动作)
// 内部有名称为initGeetest的全局变量
import './gt.js'
// import { lightblue } from 'color-name'
// import { log } from 'util'
export default {
  name: '',
  data () {
    // 声明局部函数实现校验
    var xieyiTest = function (rule, value, callback) {
      // rule:校验规则，一般无用
      // value：被校验的数据
      // callback：回调函数，校验成功或失败都要执行
      // if (value) {
      //   // 校验通过
      //   callback()
      // } else {
      //   // 校验不通过
      //   callback(new Error('请遵守协议!'))
      // }
      // 三元表达式优化
      value ? callback() : callback(new Error('请遵守协议!'))
    }
    return {
      capObj: null, // 接受极验窗口对象
      isLoading: false, // 设置按钮是否处于等待效果和是否禁用
      // 表单数据对象
      loginForm: {
        mobile: '15377777777', // 手机号码
        code: '246810', // 校验码
        xieyi: false, // 协议
        xieyiTest: ''
      },
      // 表单校验
      loginFormRules: {
        // 项目名称:[{具体校验对象规则},{具体校验对象规则}]
        // 规则：
        // required:项目必填
        // message：错误提示
        // min:信息长度最小限制
        // max:信息长度最大限制

        // 手机号码
        mobile: [
          // 必填
          { required: true, message: '手机号码必填' },
          { pattern: /^1[35789]\d{9}$/, message: '手机号码格式不正确' }
        ],
        //
        code: [
          { required: true, message: '验证码必填' }
        ],
        xieyi: [
          // {validator:函数名字} //自定义校验
          { validator: xieyiTest }
        ]
      }
    }
  },
  methods: {
    login () {
      // 表单要做校验
      // el-form表单对象.validate()
      // console.log(this)
      // this.$refs.loginFormRef // 获得el-form的组件对象
      // this.$refs.loginFormRef.validate(回调函数)
      this.$refs.loginFormRef.validate(valid => {
        // valid:true 校验通过
        // valid:false 校验失败
        // console.log(valid)
        // 校验失败，代码停止
        if (!valid) { return false }

        // 判断极验对象存在，就直接使用
        if (this.capObj !== null) {
          return this.capObj.verify()
        }
        // 设置按钮等待禁用状态
        this.isLoading = true
        // A.人机交互验证
        // axios获得极验的秘钥信息
        let pro = this.$http({
          url: '/mp/v1_0/captchas/' + this.loginForm.mobile,
          method: 'get'
        })
        pro
          .then(result => {
            console.log(result)// 极验的秘钥信息

            // 从result里面解构下述的data对象出来（对象结构赋值）
            let{ data } = result.data
            // 请检测data的数据结构， 保证data.gt, data.challenge, data.success有值
            window.initGeetest({
            // 以下配置参数来自服务端 SDK
              gt: data.gt,
              challenge: data.challenge,
              offline: !data.success,
              new_captcha: true,
              product: 'bind'// 设置验证窗口样式
            }, captchaObj => {
            // 这里可以调用验证实例 captchaObj 的实例方法
              captchaObj.onReady(() => {
                // 验证码ready之后才能调用verify方法显示验证码（可以显示窗口了）
                // 恢复按钮状态
                this.isLoading = false
                // 接受极验窗口对象
                this.capObj = captchaObj
                captchaObj.verify() // 显示验证码窗口
              }).onSuccess(() => {
                // 行为校验正确的处理
                this.loginAct()
              }).onError(() => {
                // 行为校验错误的处理
              })
            })
          })
          .catch(err => {
            return this.$message.error('获取极验秘钥失败' + err)
          })
        // B. 验证账号，登录系统
      })
    },
    // 账号真实性校验并登录系统
    loginAct () {
      // 服务器端账号真实有效校验
      let pro = this.$http({
        url: '/mp/v1_0/authorizations',
        method: 'POST',
        data: this.loginForm
        //  {
        //   mobile: '15377777777',
        //   code: '246810'
        // }
      })
      pro
        .then(result => {
          // console.log(result)// [data] status statusText headers config request
          // 客户端浏览器把服务器端返回的秘钥等相关信息通过sessionStorage做记录，表明是登录状态
          window.sessionStorage.setItem('userinfo', JSON.stringify(result.data.data))
          // 进入后台系统
          this.$router.push({ name: 'home' })
        })
        .catch(err => {
          // 通过弹出框吧错误显示出来
          // console.log('手机号码或验证码错误' + err)
          // this.$message({
          //   type: 'error',
          //   message: '手机号码或验证码错误' + err
          // })
          // 上下效果一致
          this.$message.error('手机号码或验证码错误' + err)
        })
        // 路由编程式导航
        // this.$router.push('/home')// 路由地址实现编程导航
        // this.$router.push({ name: 'home' })// name属性实现编程式导航
    }
  }
}

</script>

<style lang="less" scoped>
.login-container{
  height:100%;
  background-color: gray;
  background-image: url("./login_bg.jpg");
  background-size: cover;
  display:flex;
  justify-content: center;
  align-items: center;
  .login-box{
  width:410px;
  height:340px;
  background-color: #fff;
  display:flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  img {
      width: 55%;
      margin: 20px auto;
  }
  .el-form{
  width:75%;
      }
  }
}
</style>

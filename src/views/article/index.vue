<template>
  <div>
    <!--搜索卡片区-->
    <el-card class="box-card">
      <!--命名插槽，头部内容-->
      <div slot="header" class="clearfix">
        <span>全部图文</span>
      </div>
      <!--匿名插槽，内容主体-->
      <!--el-form搜索表单区域-->
      <el-form ref="searchFormRef" :model="searchForm" label-width="100px">
        <el-form-item label="文章状态：">
          <el-radio v-model="searchForm.status" label>全部</el-radio>
          <el-radio v-model="searchForm.status" :label="0">草稿</el-radio>
          <el-radio v-model="searchForm.status" :label="1">待审核</el-radio>
          <el-radio v-model="searchForm.status" :label="2">审核通过</el-radio>
          <el-radio v-model="searchForm.status" :label="3">审核失败</el-radio>
        </el-form-item>
        <el-form-item label="频道列表：">
          <el-select v-model="searchForm.channel_id" placeholder="请选择" clearable>
            <el-option
              v-for="item in channelList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间选择：">
          <el-date-picker
            v-model="timetotime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="box-card">
      <!--命名插槽，头部内容-->
      <div slot="header" class="clearfix">
        <span>共找到{{tot}}条符合条件的内容</span>
      </div>
      <el-table :data="articleList" style="width: 100%">
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="cover.images[0]" label="图标">
          <!-- 体现img图片标签效果 -->
          <img
            slot-scope="stData"
            :src="stData.row.cover.images[0]"
            alt="没有图标"
            width="150"
            height="100"
          />
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <!-- 获得“当前文章对象的status状态”数据，做判断进而显示对应的内容效果，作用域插槽要被使用，与获取图标原理一致 -->
          <!-- 如果许多标签都需要接受插槽数据，处于代码优雅可以考虑，可以通过一个名称为template的父标签统一接收 -->
          <template slot-scope="stData">
            <el-tag v-if="stData.row.status===0">草稿</el-tag>
            <el-tag v-else-if="stData.row.status===1" type="info">待审核</el-tag>
            <el-tag v-else-if="stData.row.status===2" type="success">审核通过</el-tag>
            <el-tag v-else-if="stData.row.status===3" type="warning">审核失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pubdate" label="发布时间"></el-table-column>
        <!-- //修改、删除不属于数据部分，只是普通的按钮，那么可以不用设置prop，对应的内容可以通过el-table-column的标签内容区域 -->
        <el-table-column label="操作">
          <el-button type="primary" size="mini" icon="el-icon-edit">修改</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </el-table-column>
      </el-table>
      <!-- @size-change//每页显示条数变化的处理事件，需要methods方法配合
         @current-change//当前页码变化的回调处理事件，需要methods方法配合
         :current-page//默认当前页码1
         :page-sizes//下拉列表，设计每页显示条数的
         :page-size//默认每页显示条数
         layout//分页元素构成设计
      :total//记录总条数-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchForm.page"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="searchForm.per_page"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tot"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Article',
  // 监听器设置
  watch: {
    // 对searchForm进行深度监听
    searchForm: {
      handler: function (newV, oldV) {
        // 根据变化后的各个筛选条件，重新获得文章列表
        this.getArticleList()
      },
      deep: true
    },
    // 被检测的成员: function (newV, oldV) {
    //   // newV:数据变化后样子
    //   // oldV:数据变化前样子
    // }
    // 被检测成员一般就是data成员,它们的名称保持一致
    timetotime: function (newV) {
      // 把接收到的时间信息一分为二给到 begin_pubdate 和 end_pubdate
      if (newV) {
        this.searchForm.begin_pubdate = newV[0]
        this.searchForm.end_pubdate = newV[1]
      } else {
        // 清除时间信息
        this.searchForm.begin_pubdate = ''
        this.searchForm.end_pubdate = ''
      }
    }
  },
  data () {
    return {
      articleList: [], // 文章列表
      tot: 0, // 文章总条数
      channelList: [], // 频道列表
      timetotime: '', // 时间范围临时接收成员
      // 检索表单数据对象
      searchForm: {
        page: 1, // 当前数据记录页码(默认)
        per_page: 10, // 分页数据记录每页条数(10~50)
        begin_pubdate: '', // 开始时间
        end_pubdate: '', // 结束时间
        channel_id: '', // 频道id
        status: '' // 文章状态，''-全部, 0-草稿，1-待审核，2-审核通过，3-审核失败
      }
    }
  },
  created () {
    // 获得频道信息
    this.getChannelList()
    // 获得文章
    this.getArticleList()
  },
  methods: {
    // 分页相关
    // 每条条数变化的回调处理
    handleSizeChange (val) {
      // val: 变化后的每页条数
      // 更新每页条数
      this.searchForm.per_page = val
      // 根据变化后的每页条数重新获得文章列表
      // this.getArticleList()
    },
    // 页码变化的回调处理
    handleCurrentChange (val) {
      // val: 变化后的页码
      // 更新页码
      this.searchForm.page = val
      // 根据变化后页码重新获得文章列表
      // this.getArticleList()
    },
    // 获得真实文章列表数据
    getArticleList () {
      // 把searchForm内部为空的成员都‘过滤掉’
      let searchData = {}
      for (var i in this.searchForm) {
        // i:代表对象的成员属性名称，status、channel_id、begin_pudate等等
        if (this.searchForm[i] || this.searchForm[i] === 0) {
          // 成员值非空
          searchData[i] = this.searchForm[i]
        }
      }

      let pro = this.$http({
        url: '/mp/v1_0/articles',
        method: 'get',
        params: searchData
      })
      pro
        .then(result => {
          console.log(result)
          // data接收频道数据
          this.articleList = result.data.data.results
          // 接收总条数
          this.tot = result.data.data.total_count
        })
        .catch(err => {
          return this.$message.error('获得文章列表：' + err)
        })
    },
    // 获得真实频道列表数据
    getChannelList () {
      let pro = this.$http({
        url: '/mp/v1_0/channels',
        method: 'get'
      })
      pro
        .then(result => {
          // console.log(result)
          // data接收频道数据
          this.channelList = result.data.data.channels
        })
        .catch(err => {
          return this.$message.error('获得频道失败：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
//给卡片区设置向下的外边距
.box-card {
  margin-bottom: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>

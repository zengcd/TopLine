<template>
  <el-container>
  <el-aside width="200px">Aside</el-aside>
  <el-container>
    <el-header>Header</el-header>
    <el-main>Main</el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
}
</script>

<style lang="less" scoped>
.el-container{
  height: 100%;
  .el-aside{
    background-color: rgb(50,55,69);
  }
.el-header{
  background-color: orange;
}
.el-main{
  background-color: lightgray;
}
}
</style>

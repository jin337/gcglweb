<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
  </div>
</template>

<script>
export default {
  name: 'App',
  provide () {
    return {
      reload: this.reload
    }
  },
  data () {
    return {
      isRouterAlive: true
    }
  },
  methods: {
    reload () {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style lang="scss">
html,
body {
  height: 100%;
  overflow: hidden;
}
/*css初始样式*/
body,
ol,
ul,
h1,
h2,
h3,
h4,
h5,
h6,
p,
th,
td,
dl,
dd,
form,
fieldset,
legend,
input,
textarea,
select {
  margin: 0;
  padding: 0;
}
body,
textarea,
select,
button {
  background: #e7ebee;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei",
    "微软雅黑", Arial, sans-serif;
}
ul,
li {
  list-style: none;
}

a {
  color: #409eff;
  transition: color 0.2s;
}
a:hover {
  color: #66b1ff;
}
.el-table th.gutter {
  display: table-cell !important;
}
.el-dialog__body{
  padding-top:10px!important;
}
.el-button,.el-input__inner{
  border-radius:0!important;
}
#app{
  height:100%;
  background:#fff;
}
</style>

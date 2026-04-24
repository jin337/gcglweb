<template>
  <div>
    <el-select
      v-model="project"
      width="200px;"
      placeholder="请选择"
      @change="handleProjectChange"
      value-key="id"
    >
      <el-option
        v-for="item in projectList"
        :key="item.projectCode"
        :label="item.projectName"
        :value="item"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'warehousetest1',
  data() {
    return {
      project: null,
      projectList: []
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      try {
        const params = {
          user_id: this.$store.state.userInfo.id
        }
        const result = await this.$pub.post('/project/project-list-by-user', params)
        if (result.code === 200) {
          if (result.data !== null) {
            this.projectList = result.data
          } else {
            this.projectList = []
          }
        } else {
          this.$notify.error({
            title: '查询失败',
            message: result.message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '服务器请求失败',
          message: e.message
        })
      }
    },
    handleProjectChange(val) {
      console.log(val)
    }
  }
}
</script>

<style scoped>

</style>

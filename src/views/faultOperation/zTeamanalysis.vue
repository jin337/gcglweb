<template>
  <div class="faultoperastatisticalpoint" v-loading="loading">
    <el-form size="small" inline label-width="80px">
      <el-form-item label="项目">
        <el-select
          v-model="form.project"
          placeholder="请选择"
          clearable
          style="width: 220px"
          size="small"
          @clear="handleQuery"
          @change="handleProjectChange"
          ><el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.projectName"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="施工单位">
        <el-select
          v-model="form.area"
          placeholder="默认所有施工单位"
          multiple
          collapse-tags
          clearable
          style="width: 220px"
          size="small"
          @clear="handleQuery"
        >
          <el-option
            v-for="item in areaList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维修时间">
        <el-date-picker
          v-model="form.completeTime"
          type="datetimerange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd"
          style="width: 220px"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item class="add">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </el-form>

    <el-table border :data="tableData">
      <el-table-column type="index" label="序号" width="50"> </el-table-column>
      <el-table-column prop="name1" label="项目名称"></el-table-column>
      <el-table-column prop="name2" label="修复点位数量" align="center" width="110"></el-table-column>
      <el-table-column prop="name3" label="修复设备数量" align="center" width="110"></el-table-column>
      <el-table-column prop="name4" align="center" width="150">
        <template  slot="header" slot-scope="scope">
          <div>维修效率</div>
          <div>（点位、设备）</div>
        </template>
      </el-table-column>
      <el-table-column prop="name5" label="总工作时长（小时）" align="center" width="100"></el-table-column>
      <el-table-column prop="name6" label="日均工作时长（小时）" align="center" width="110"></el-table-column>
      <el-table-column prop="name7" label="用工人数" align="center" width="100"></el-table-column>
      <el-table-column prop="name8" label="用车数" align="center" width="100"></el-table-column>
      <el-table-column prop="name4" align="center" width="120">
        <template  slot="header" slot-scope="scope">
          <div>维护费用</div>
          <div>（人工+车辆）</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { checkPermission, parseTime } from "@/utils/tool";
export default {
  name: "faultOperationTeamanalysis",
  data() {
    return {
      loading: false,
      projectList: [],
      areaList: [],
      childList: [],
      form: {
        name81: 1,
        project: null,
        project_id: null,
        project_code: null,
        project_name: "",
        child_code: null,
        area: [],
      },
      rangeList: [
        { value: 1, label: ">=" },
        { value: 2, label: "=" },
        { value: 3, label: "<=" },
      ],
      tableData: [],
    };
  },
  created() {
    this.getProjectList();
  },
  mounted() {},
  components: {},
  methods: {
    checkPermission,
    parseTime,
    async getProjectList() {
      try {
        const have = this.checkPermission(["pointAuthorization:project-slt"]);
        let url = "/project/project-list-by-user";
        let params = {
          user_id: this.$store.state.userInfo.id,
        };

        // ischeckAllproject表示是否需要校验
        if (have) {
          url = "/project/list-slt";
          params = { content: "" };
        }

        const result = await this.$pub.post(url, params);
        if (result.code === 200) {
          if (result.data !== null) {
            this.projectList = result.data.map((m) => {
              return {
                ...m,
                projectCode: m.projectCode ? m.projectCode : m.project_code,
                projectName: m.projectName ? m.projectName : m.project_name,
              };
            });
          } else {
            this.projectList = [];
          }
        } else {
          this.$notify.error({
            title: "查询失败",
            message: result.message,
          });
        }
      } catch (e) {
        this.$notify.error({
          title: "服务器请求失败",
          message: e.message,
        });
      }
    },
    async getChildList() {
      if (!this.form.project_code) {
        return this.$message({
          message: "必须选择一个项目进行查询",
          type: "error",
          showClose: true,
          customClass: "uploadMessage",
        });
      }
      try {
        const { data, code, message } = await this.$pub.post(
          "project/child-list",
          { project_id: this.form.project_id }
        );
        if (code === 200) {
          this.childList = data || [];
        } else {
          this.childList = [];
          this.$notify.error({
            title: "查询失败",
            message: message,
          });
        }
      } catch (e) {
        this.$notify.error({
          title: "服务器请求失败",
          message: e.message,
        });
      }
    },
    async getAreaList() {
      if (!this.form.project_code) {
        return this.$message({
          message: "必须选择一个项目进行查询",
          type: "error",
          showClose: true,
          customClass: "uploadMessage",
        });
      }
      try {
        const { data, code, message } = await this.$pub.post(
          "/project/area-list",
          { project_id: this.form.project_id }
        );
        if (code === 200) {
          this.areaList = data || [];
        } else {
          this.areaList = [];
          this.$notify.error({
            title: "查询失败",
            message: message,
          });
        }
      } catch (e) {
        this.$notify.error({
          title: "服务器请求失败",
          message: e.message,
        });
      }
    },
    // 监控项目变更
    handleProjectChange(val) {
      this.form.project_code = val.projectCode;
      this.form.project_id = val.id;
      this.form.project_name = val.projectName;
      this.form.area = [];
      this.form.child_code = "";
      this.childList = [];
      this.areaList = [];
      this.getAreaList();
      this.getChildList();
    },
    // 点击搜索
    handleQuery() {
      console.log(this.form)
    },
  },
};
</script>

<style lang="scss">
.faultoperastatisticalpoint {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
</style>

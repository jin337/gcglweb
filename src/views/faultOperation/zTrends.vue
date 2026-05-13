<template>
  <div class="faultOperationTrends" v-loading="tableLoading">
    <el-form size="small" inline label-width="80px">
      <el-form-item label="项目">
        <el-select v-model="form.project" placeholder="请选择" clearable style="width: 220px" size="small"
          @clear="handleQuery" @change="handleProjectChange" value-key="id">
          <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="施工单位">
        <el-select v-model="form.dept_id" placeholder="请选择" clearable style="width: 220px" size="small">
          <el-option v-for="item in builderList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="子系统">
        <el-select v-model="form.child_code" clearable style="width: 220px" placeholder="默认所有子系统">
          <el-option v-for="item in childList" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位">
        <el-input v-model="form.content" clearable size="small" style="width: 220px"></el-input>
      </el-form-item>
      <el-form-item label="报修类型">
        <el-select v-model="form.fault_type" placeholder="请选择" clearable style="width: 220px" size="small">
          <el-option v-for="item in faultTypeList" :key="item.value" :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="故障定性">
        <el-select v-model="form.fault_proc" placeholder="请选择" clearable style="width: 220px" size="small">
          <el-option v-for="item in designList" :key="item.proc_code" :label="item.proc_name"
            :value="item.proc_code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维修时间">
        <el-date-picker v-model="form.completeTime" :clearable="false" type="daterange" align="right" unlink-panels range-separator="至"
          start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd" style="width: 220px">
        </el-date-picker>
      </el-form-item>

      <el-form-item class="add">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table border :data="tableData">
      <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
      <el-table-column prop="project_name" label="项目名称"></el-table-column>
      <el-table-column prop="pdsl" align="center" width="150">
        <template slot="header">
          <div>派单数量</div>
          <div>(本期/同比/环比)</div>
        </template>
      </el-table-column>
      <el-table-column prop="jdsl" align="center" width="150">
        <template slot="header">
          <div>结单数量</div>
          <div>(本期/同比/环比)</div>
        </template>
      </el-table-column>
      <el-table-column prop="ygsl" align="center" width="150">
        <template slot="header">
          <div>用工数量</div>
          <div>(本期/同比/环比)</div>
        </template>
      </el-table-column>
      <el-table-column prop="ycsl" align="center" width="150">
        <template slot="header">
          <div>用车数量</div>
          <div>(本期/同比/环比)</div>
        </template>
      </el-table-column>
      <el-table-column prop="fy" align="center" width="150">
        <template slot="header">
          <div>维护费用</div>
          <div>(本期/同比/环比)</div>
        </template>
      </el-table-column>
      <el-table-column prop="whcb" align="center" width="150">
        <template slot="header">
          <div>单点维护成本</div>
          <div>(本期/同比/环比)</div>
        </template>
      </el-table-column>
      <el-table-column prop="whxl" align="center" width="150">
        <template slot="header">
          <div>单人维护效率</div>
          <div>(本期/同比/环比)</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { checkPermission, parseTime } from "@/utils/tool";
export default {
  name: "faultOperationTrends",
  data() {
    // 获取本周的开始时间（周一）和结束时间（周日）
    const now = new Date();
    const currentDay = now.getDay() || 7; // 将周日(0)转换为7
    const start = new Date(now);
    start.setDate(now.getDate() - currentDay + 1); // 本周一
    const end = new Date(now);
    end.setDate(now.getDate() - currentDay + 7); // 本周日

    // 格式化为 yyyy-MM-dd
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };
    return {
      tableLoading: false,
      projectList: [],
      childList: [],
      builderList: [],
      designList: [],
      faultTypeList: [],
      form: {
        project: null, // 项目
        dept_id: null, // 施工单位
        child_code: null, // 子系统
        content: null, // 点位
        fault_type: null, // 报修类型
        fault_proc: null, // 故障定性
        completeTime: [formatDate(start), formatDate(end)], // 维修时间
      },
      tableData: [],
    };
  },
  created() {
    this.getDesignList();
    this.getfault_type();
    this.getProjectList();
  },
  mounted() { },
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
    // 维修单位
    async getBuilderList() {
      if (!this.form.project_code) {
        return this.$message({
          message: "必须选择一个项目进行查询",
          type: "error",
          showClose: true,
          customClass: "uploadMessage",
        });
      }
      var req = {
        project_code: this.form.project_code,
      };
      const { code, data, message } = await this.$pub.post(
        "/rate/builder-dept-list",
        req
      );
      if (code === 200) {
        this.builderList = data || [];
      } else {
        this.$notify.error({
          title: "维修单位查询失败",
          message: message,
        });
      }
    },
    // 故障定性
    async getDesignList() {
      var req = {
        fid: "CLS012",
      };
      const { code, data, message } = await this.$pub.post(
        "/proc/step/list",
        req
      );
      if (code === 200) {
        if (data !== null) {
          this.designList = data.list;
        }
      } else {
        this.$notify.error({
          title: "故障定性查询失败",
          message: message,
        });
      }
    },
    // 报修类型
    getfault_type() {
      this.$dict(this, "fault_type").then((res) => {
        if (res.code === 200) {
          this.faultTypeList = (res.data || []).map((m) => {
            return {
              value: Number(m.value),
              label: m.label,
            };
          });
        } else {
          this.$message({
            type: "error",
            message: "字典获取出错了fault_type",
            showClose: true,
          });
          this.faultTypeList = [];
        }
      });
    },
    // 监控项目变更
    handleProjectChange(val) {
      this.form.project_code = val.projectCode;
      this.form.project_id = val.id;
      this.form.project_name = val.projectName;

      this.form.child_code = null;
      this.form.dept_id = null;

      this.childList = [];
      this.builderList = [];

      this.getChildList();
      this.getBuilderList();

      this.handleQuery();
    },
    // 点击搜索
    handleQuery() {
      this.tableData = [];
      this.getList();
    },
    // 查询接口
    async getList() {
      if (!this.form.project_code) {
        return this.$message({
          message: "必须选择一个项目进行查询",
          type: "error",
          showClose: true,
          customClass: "uploadMessage",
        });
      }

      this.tableLoading = true;
      const completeTime = this.form.completeTime || [];
      const params = {
        project_code: this.form.project_code,
        dept_id: this.form?.dept_id || -1,
        child_code: this.form.child_code,
        content: this.form.content,
        fault_type: this.form.fault_type,
        fault_proc: this.form.fault_proc,

        begin_time: completeTime[0] ? completeTime[0] : null,
        end_time: completeTime[1] ? completeTime[1] : null,
      };
      const { data, code } = await this.$pub.post(
        "/point/order/const/trend",
        params
      );
      this.tableLoading = false;
      if (code !== 200) {
        this.tableData = [];
        return this.$message({
          message: "获取列表出错了",
          type: "error",
          showClose: true,
        });
      }
      this.total = data.total;
      this.tableData = data.list || [];
    },
    // 点击重置
    handleReset() {
      // 重新计算本周时间
      const now = new Date();
      const currentDay = now.getDay() || 7;
      const start = new Date(now);
      start.setDate(now.getDate() - currentDay + 1);
      const end = new Date(now);
      end.setDate(now.getDate() - currentDay + 7);

      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };
      this.form = {
        project: null, // 项目
        dept_id: null, // 施工单位
        child_code: null, // 子系统
        content: null, // 点位
        fault_type: null, // 报修类型
        fault_proc: null, // 故障定性
        completeTime: [formatDate(start), formatDate(end)], // 维修时间
      };
      this.tableData = [];
    },
  },
};
</script>

<style lang="scss">
.faultOperationTrends {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
</style>

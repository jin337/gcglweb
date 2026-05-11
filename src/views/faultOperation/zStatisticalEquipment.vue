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
          @change="handleProjectChange"
          value-key="id"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.projectName"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="区域">
        <el-select
          v-model="form.area"
          placeholder="默认所有区域"
          multiple
          collapse-tags
          clearable
          style="width: 220px"
          size="small"
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
      <el-form-item label="子系统">
        <el-select
          v-model="form.child_code"
          clearable
          style="width: 220px"
          placeholder="默认所有子系统"
        >
          <el-option
            v-for="item in childList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位">
        <el-input
          v-model="form.content"
          clearable
          size="small"
          style="width: 220px"
        ></el-input>
      </el-form-item>
      <el-form-item label="报修类型">
        <el-select
          v-model="form.fault_type"
          placeholder="请选择"
          clearable
          style="width: 220px"
          size="small"
        >
          <el-option
            v-for="item in faultTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="故障定性">
        <el-select
          v-model="form.fault_proc"
          placeholder="请选择"
          clearable
          style="width: 220px"
          size="small"
        >
          <el-option
            v-for="item in designList"
            :key="item.class_code"
            :label="item.class_name"
            :value="item.class_code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维修单位">
        <el-select
          v-model="form.dept_id"
          placeholder="请选择"
          clearable
          style="width: 220px"
          size="small"
        >
          <el-option
            v-for="item in builderList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报修次数">
        <el-select style="width: 60px" v-model="form.count_content_unit">
          <el-option
            v-for="item in rangeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-input
          v-model="form.count_content"
          placeholder="默认所有报修次数"
          clearable
          size="small"
          style="width: 160px"
        ></el-input>
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
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table border :data="tableData">
      <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
      <el-table-column prop="project_name" label="项目名称"></el-table-column>
      <el-table-column prop="area" label="区域" width="100"></el-table-column>
      <el-table-column
        prop="child_name"
        label="子系统"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="point_code"
        label="点位编码"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="point_name"
        label="点位名称"
      ></el-table-column>
      <el-table-column
        prop="name1"
        label="设备名称"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="device_ip"
        label="设备ip"
        width="120" align="center"
      ></el-table-column>
      <el-table-column prop="name1" label="状态" width="80" align="center"></el-table-column>
      <el-table-column
        prop="sbbzzs"
        label="报障数量"
        width="90" align="center"
      ></el-table-column>
    </el-table>

    <div style="display: flex; justify-content: space-between; margin-top: 10px" v-if="total > 0">
      <span style="color: #999; font-size: 14px">共 {{ total }} 条记录</span>
      <el-pagination
        layout="prev, pager, next,sizes"
        :total="total"
        :page-size.sync="page.page_size"
        @current-change="pageChange"
        @size-change="sizeChange"
        :current-page.sync="page.page_no"
        class="pagination"
        small
        background
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { checkPermission, parseTime } from "@/utils/tool";
export default {
  name: "faultoperastatisticalequipment",
  data() {
    return {
      loading: false,
      projectList: [],
      areaList: [],
      childList: [],
      faultTypeList: [],
      builderList: [],
      designList: [],
      form: {
        count_content_unit: 1,
      },
      rangeList: [
        { value: 1, label: ">=" },
        { value: 2, label: "=" },
        { value: 3, label: "<=" },
      ],
      tableData: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10,
      },
    };
  },
  created() {
    this.getDesignList();
    this.getfault_type();
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
          { project_id: this.form.project.id }
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
    // 维修单位
    async getBuilderList() {
      var req = {
        project_code: this.form.project_code,
      };
      const { code, data, message } = await this.$pub.post(
        "/rate/builder-dept-list",
        req
      );
      if (code === 200) {
        this.BuilderList = data || [];
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
        content: "",
      };
      const { code, data, message } = await this.$pub.post(
        "/proc/class/list",
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
    // 故障类型
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
      this.form.area = [];
      this.form.child_code = "";
      this.form.dept_id = "";
      this.childList = [];
      this.areaList = [];
      this.builderList = [];
      this.getAreaList();
      this.getChildList();
      this.getBuilderList();
    },
    // 点击搜索
    handleQuery() {
      this.page.page_no = 1;
      this.getList();
    },

    // 查询接口
    async getList() {
      this.tableLoading = true;
      const completeTime = this.form.completeTime || [];
      const params = {
        project_code: this.form.project_code,
        content: this.form.content,
        area: this.form.area,
        child_code: this.form.child_code,
        fault_type: this.form.fault_type,
        fault_proc: this.form.fault_proc,
        dept_id: this.form?.dept_id || -1,
        count_content: this.form.count_content,
        count_content_unit: this.form.count_content_unit,
        begin_time: completeTime[0] ? completeTime[0] + " 00:00:00" : null,
        end_time: completeTime[1] ? completeTime[1] + " 23:59:59" : null,
        page_no: this.page.page_no,
        page_size: this.page.page_size,
      };
      const { data, code } = await this.$pub.post(
        "/point/order/count/device",
        params
      );
      this.tableLoading = false;
      if (code !== 200) {
        this.total = 0;
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
    pageChange(num) {
      this.page.page_no = num;
      this.getList();
    },
    sizeChange(val) {
      this.page.page_size = val;
      this.getList();
    },
    // 点击重置
    handleReset() {
      this.form = {
        count_content_unit: 1,
      };
      this.childList = [];
      this.areaList = [];
      this.BuilderList = [];
      this.designList = [];
    },
  },
};
</script>

<style lang="scss">
.faultoperastatisticalequipment {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
</style>

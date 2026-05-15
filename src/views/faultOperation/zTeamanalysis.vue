<template>
  <div class="faultOperationTeamanalysis" v-loading="tableLoading">
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
      <el-form-item label="维修时间">
        <el-date-picker v-model="form.completeTime" type="daterange" align="right" unlink-panels range-separator="至"
          start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd" style="width: 220px">
        </el-date-picker>
      </el-form-item>

      <el-form-item class="add">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table border :data="tableData">
      <el-table-column type="index" label="序号" width="50"> </el-table-column>
      <el-table-column prop="project_name" label="项目名称"></el-table-column>
      <el-table-column prop="xfdws" label="修复点位数量" align="center" width="110">
        <template slot-scope="{ row }">
          <span class="hand" @click="openDetail(row)">{{ row?.xfdws }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="xfsbs" label="修复设备数量" align="center" width="110"></el-table-column>
      <el-table-column prop="dwxl" align="center" width="150">
        <template slot="header">
          <div>维修效率</div>
          <div>（点位、设备）</div>
        </template>
      </el-table-column>
      <el-table-column prop="zsc" label="总工作时长（小时）" align="center" width="100"></el-table-column>
      <el-table-column prop="pjsc" label="日均工作时长（小时）" align="center" width="110"></el-table-column>
      <el-table-column prop="ygsl" label="用工人数" align="center" width="100"></el-table-column>
      <el-table-column prop="ycsl" label="用车数" align="center" width="100"></el-table-column>
      <el-table-column prop="fy" align="center" width="120">
        <template slot="header">
          <div>维护费用</div>
          <div>（人工+车辆）</div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情 -->
    <el-dialog title="详情" :visible.sync="detailFlag" width="80%" fullscreen append-to-body @close="detailFlag = false">
      <el-table border :data="rowDetailList" v-loading="rowLoading">
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column prop="work_date" label="日期" align="center" width="120">
          <template slot-scope="{ row }">
            <span>{{ row.work_date ? parseTime(row.work_date, '{y}-{m}-{d}') : "" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="xfdws" label="修复点位数量" align="center" width="110"></el-table-column>
        <el-table-column prop="xfsbs" label="修复设备数量" align="center" width="110"></el-table-column>
        <el-table-column prop="pzsl" label="拍照数量" align="center" width="90"></el-table-column>
        <el-table-column prop="min_time" label="上班时间(第一张拍照时间)"></el-table-column>
        <el-table-column prop="max_time" label="下班时间(最后一张拍照时间)"></el-table-column>
        <el-table-column prop="ygsl" label="用工数量" align="center" width="80"></el-table-column>
        <el-table-column prop="ycsl" label="用车数" align="center" width="80"></el-table-column>
        <el-table-column label="当日工作时长" align="center" width="110">
          <template slot-scope="{ row }">
            <span>{{ calculateDuration(row.max_time, row.min_time) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; justify-content: space-between; margin-top: 10px" v-if="total > 0">
        <span style="color: #999; font-size: 14px">共 {{ total }} 条记录</span>
        <el-pagination layout="prev, pager, next,sizes" :total="total" :page-size.sync="page.page_size"
          @current-change="pageChange" @size-change="sizeChange" :current-page.sync="page.page_no" class="pagination"
          small background>
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { checkPermission, parseTime } from "@/utils/tool";
import dayjs from "dayjs";
export default {
  name: "faultOperationTeamanalysis",
  data() {
    return {
      tableLoading: false,
      projectList: [],
      builderList: [],
      form: {
        project: null, // 项目
        dept_id: null, // 施工单位
        completeTime: [], // 维修时间
      },
      tableData: [],
      total: 0,
      page: {
        page_no: 1,
        page_size: 10,
      },
      rowDetail: null,
      detailFlag: false,
      rowDetailList: [],
      rowLoading: false,
    };
  },
  created() {
    this.getProjectList();
  },
  mounted() { },
  components: {},
  methods: {
    checkPermission,
    parseTime,
    // 计算工作时长
    calculateDuration(maxTime, minTime) {
      if (!maxTime || !minTime) return '-';

      const max = dayjs(maxTime);
      const min = dayjs(minTime);

      if (!max.isValid() || !min.isValid()) return '-';
      const diffMs = max.diff(min);
      if (diffMs < 0) return '0';
      const hours = (diffMs / (1000 * 60 * 60)).toFixed(2);

      return `${hours}小时`;
    },
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

        begin_time: completeTime[0] ? completeTime[0] : null,
        end_time: completeTime[1] ? completeTime[1] : null,
      };
      const { data, code } = await this.$pub.post(
        "/point/order/deptAnalyze/main",
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
    // 监控项目变更
    handleProjectChange(val) {
      this.form.project_code = val.projectCode;
      this.form.project_id = val.id;
      this.form.project_name = val.projectName;

      this.form.dept_id = null;

      this.builderList = [];

      this.getBuilderList();

      this.handleQuery();
    },
    // 点击搜索
    handleQuery() {
      this.tableData = [];
      this.getList();
    },
    // 点击重置
    handleReset() {
      this.form = {
        project: null, // 项目
        dept_id: null, // 施工单位
        completeTime: [], // 维修时间
      };
      this.tableData = [];
    },
    // 打开详情
    openDetail(row) {
      this.total = 0;
      this.page.page_no = 1;

      this.rowDetail = row;
      this.rowDetailList = [];
      this.detailFlag = true;
      this.getDetailList(row);
    },
    // 获取详情列表
    async getDetailList(row) {
      this.rowLoading = true;
      const completeTime = this.form.completeTime || [];
      const params = {
        project_code: row.project_code,
        page_no: this.page.page_no,
        page_size: this.page.page_size,

        dept_id: this.form?.dept_id || -1,

        begin_time: completeTime[0] ? completeTime[0] : null,
        end_time: completeTime[1] ? completeTime[1] : null,
      };
      const { code, data, message } = await this.$pub.post(
        "/point/order/deptAnalyze/detail",
        params
      );
      this.rowLoading = false;
      if (code !== 200) {
        this.total = 0;
        this.rowDetailList = [];
        return this.$message({
          message: "获取列表出错了",
          type: "error",
          showClose: true,
        });
      }
      this.total = data.total;
      this.rowDetailList = data.list || [];
    },
    pageChange(num) {
      this.page.page_no = num;
      this.getDetailList(this.rowDetail);
    },
    sizeChange(val) {
      this.page.page_size = val;
      this.getDetailList(this.rowDetail);
    },
  },
};
</script>

<style lang="scss">
.faultOperationTeamanalysis {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  .hand {
    cursor: pointer;
    color: #409eff;
  }
}
</style>

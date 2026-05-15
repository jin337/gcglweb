<template>
  <div class="faultOperationOrderanalysis" v-loading="tableLoading">
    <el-form size="small" inline label-width="80px" :model="form">
      <el-form-item label="项目">
        <el-select v-model="form.project" placeholder="请选择" clearable style="width: 220px" size="small"
          @clear="handleQuery" @change="handleProjectChange" value-key="id">
          <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="施工单位">
        <treeselect v-model="form.dept_id" :normalizer="normalizer" placeholder="输入搜索词查询部门" :options="deptOptions"
          style="width:250px;" />
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
      <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
      <el-table-column prop="project_name" label="项目名称"></el-table-column>
      <el-table-column prop="pdsl" label="派单数量" width="100" align="center">
        <template slot-scope="{ row }">
          <span class="hand" @click="openDetail(row)">{{ row?.pdsl }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="jdsl" label="结单数量" width="100" align="center"></el-table-column>
      <el-table-column prop="ygsl" label="用工数量" width="100" align="center"></el-table-column>
      <el-table-column prop="ycsl" label="用车数量" width="100" align="center"></el-table-column>
      <el-table-column prop="fy" label="维护费用" width="100" align="center"></el-table-column>
      <el-table-column prop="xfsbs" label="修复设备数" width="100" align="center"></el-table-column>
      <el-table-column prop="xfdws" label="修复点位数" width="100" align="center"></el-table-column>
    </el-table>

    <!-- 详情 -->
    <el-dialog title="详情" :visible.sync="detailFlag" width="80%" fullscreen append-to-body @close="detailFlag = false">
      <el-table border size="small" :data="rowDetailList" v-loading="rowLoading">
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column prop="project_name" label="项目名称"></el-table-column>
        <el-table-column prop="order_code" label="工单编号" width="180"></el-table-column>
        <el-table-column prop="assign_name" label="派发人" align="center" width="90"></el-table-column>
        <el-table-column prop="create_time" label="派单时间" align="center" width="160">
          <template slot-scope="{ row }">
            <span>{{ row.create_time ? parseTime(row.create_time) : "" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dws" label="报障点位数量/修复点位数量" align="center" width="110"></el-table-column>
        <el-table-column prop="sbs" label="报障设备数量/修复设备数量" align="center" width="110"></el-table-column>
        <el-table-column prop="dept_name" label="施工队单位" width="110"></el-table-column>
        <el-table-column prop="ygsl" label="用工数量" align="center" width="80"></el-table-column>
        <el-table-column prop="ycsl" label="用车数量" align="center" width="80"></el-table-column>
        <el-table-column prop="fy" label="维护费用" align="center" width="80"></el-table-column>
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
export default {
  name: "faultOperationOrderanalysis",
  data() {
    return {
      tableLoading: false,
      projectList: [],
      childList: [],
      deptOptions: [],
      designList: [],
      faultTypeList: [],
      form: {
        project: null, // 项目
        dept_id: null, // 施工单位
        child_code: null, // 子系统
        content: null, // 点位
        fault_type: null, // 报修类型
        fault_proc: null, // 故障定性
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
    this.getDesignList();
    this.getfault_type();
    this.getDept();
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
    async getDept() {
      const { data, code } = await this.$pub.post('/sys/dept/list-tree', { mc: '' })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取部门出错了',
          showClose: true
        })
      }
      const datas = Array.isArray(data.dept) ? data.dept : data.dept.child
      this.deptOptions = datas
    },
    normalizer(node) { /** 转换菜单数据结构 */
      if (node.child && !node.child.length) {
        delete node.child
      }
      return {
        id: node.id,
        label: node.mc,
        children: node.child
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

      this.getChildList();

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
        "/point/order/analyze/main",
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
      this.form = {
        project: null, // 项目
        dept_id: null, // 施工单位
        child_code: null, // 子系统
        content: null, // 点位
        fault_type: null, // 报修类型
        fault_proc: null, // 故障定性
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
        child_code: this.form.child_code,
        content: this.form.content,
        fault_type: this.form.fault_type,
        fault_proc: this.form.fault_proc,

        begin_time: completeTime[0] ? completeTime[0] : null,
        end_time: completeTime[1] ? completeTime[1] : null,
      };
      const { code, data, message } = await this.$pub.post(
        "/point/order/analyze/detail",
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
.faultOperationOrderanalysis {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  .hand {
    cursor: pointer;
    color: #409eff;
  }

  .vue-treeselect__control {
    height: 30px;
    border-radius: 0;
  }

  .vue-treeselect--has-value .vue-treeselect__input {
    vertical-align: middle
  }
}
</style>

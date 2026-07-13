<template>
  <div class="operator-wrap" v-loading="tableLoading">
    <el-form size="small" inline>
      <el-form-item label="项目">
        <el-select v-model="form.project" placeholder="请选择" clearable style="width: 220px" size="small"
          @clear="handleQuery" @change="handleProjectChange" value-key="id">
          <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item class="add">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
      <div style="float: right;"><el-button type="primary" size="small" @click="handleExport">导出</el-button></div>
    </el-form>

    <el-table border :data="tableData" :height="tableHeight">
      <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
      <el-table-column prop="point_code" label="点位编码" width="140"></el-table-column>
      <el-table-column prop="point_name" label="点位名称"></el-table-column>
      <el-table-column prop="operator_name" label="运营商名称" width="100"></el-table-column>
      <el-table-column prop="access_number" label="接入号" width="180"></el-table-column>
      <el-table-column prop="operator_status_name" label="链路接入状态" width="110"></el-table-column>
      <el-table-column prop="link_properties_name" label="链路属性" width="90"></el-table-column>
      <el-table-column prop="oper_dept_name" label="施工单位"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
    </el-table>

    <div style="display:flex;justify-content:space-between; margin-top: 20px;">
      <span style="color:#999;font-size:14px;">共 {{ total }} 条记录</span>
      <el-pagination layout="prev, pager, next,sizes" :total="total" :page-size.sync="form.page_size"
        @current-change="pageChange" @size-change="sizeChange" :current-page.sync="form.page_no" class="pagination"
        small background>
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { checkPermission, parseTime } from "@/utils/tool";
export default {
  name: "operator",
  data() {
    return {
      tableLoading: false,
      tableHeight: 0,
      projectList: [],
      form: {
        project: null, // 项目
        page_no: 1,
        page_size: 10,
      },
      total: 0,
      tableData: [],
    };
  },
  created() {
    this.getProjectList();
  },
  mounted() {
    this.getTableHeight()
    window.addEventListener('resize', () => this.getTableHeight())
  },
  components: {},
  methods: {
    checkPermission,
    parseTime,
    getTableHeight() {
      this.$nextTick(() => {
        const el_wrap = document.getElementsByClassName('operator-wrap')[0]
        if (el_wrap) {
          const el_form = el_wrap.getElementsByClassName('el-form')[0]
          const el_formh = el_form.offsetHeight
          this.tableHeight = el_wrap.offsetHeight - (el_formh + 90)
        }
      })
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
    // 监控项目变更
    handleProjectChange(val) {
      this.form.project_code = val.projectCode;
      this.form.project_id = val.id;
      this.form.project_name = val.projectName;

      this.handleQuery();
    },
    // 点击搜索
    handleQuery() {
      this.tableData = [];
      this.pageChange(1)
    },

    pageChange(num) {
      this.form.page_no = num
      this.getList()
    },
    sizeChange(val) {
      this.form.page_size = val
      this.getList()
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
      const params = {
        project_code: this.form.project_code,
        page_no: this.form.page_no,
        page_size: this.form.page_size,
      };
      const { data, code } = await this.$pub.post(
        "/point/operator/list-project",
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
      this.form.page_no = data.page || 1;
    },
    // 点击重置
    handleReset() {
      this.form = {
        project: null, // 项目
        page_no: 1,
        page_size: 10,
      };
      this.tableData = [];
    },
    // 导出
    async handleExport() {
      if (!this.form.project_code) {
        return this.$message({
          message: "必须选择一个项目进行查询",
          type: "error",
          showClose: true,
          customClass: "uploadMessage",
        });
      }

      const params = {
        project_code: this.form.project_code,
      };
      const result = await this.$pub.post(
        "/point/operator/list-project-exp",
        params, {
        headers: {
          'Content-Type': 'application/x-download'
        },
        responseType: 'blob'
      }
      );
      downloadFile(result, '运营商查询', 'xlsx')
    }
  },
};
</script>

<style lang="scss">
.operator-wrap {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  .vue-treeselect__control {
    height: 30px;
    border-radius: 0;
  }

  .vue-treeselect--has-value .vue-treeselect__input {
    vertical-align: middle
  }
}
</style>

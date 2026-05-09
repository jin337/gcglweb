<template>
  <div class="faultOperationTrends" v-loading="loading">
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
            v-for="item in List"
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
          placeholder="默认所有子系统"
          clearable
          style="width: 220px"
          size="small"
          @clear="handleQuery"
        >
          <el-option
            v-for="item in List"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点位">
        <el-input
          v-model="form.name4"
          clearable
          size="small"
          style="width: 220px"
        ></el-input>
      </el-form-item>
      <el-form-item label="报修类型">
        <el-select
          v-model="form.name1"
          placeholder="请选择"
          clearable
          style="width: 220px"
          size="small"
        >
          <el-option
            v-for="item in []"
            :key="item.id"
            :label="item.name2"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="故障定性">
        <el-select
          v-model="form.name1"
          placeholder="请选择"
          clearable
          style="width: 220px"
          size="small"
        >
          <el-option
            v-for="item in []"
            :key="item.id"
            :label="item.name2"
            :value="item"
          ></el-option>
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
      <el-table-column prop="name2" align="center" width="150">
        <template slot="header" slot-scope="scope">
          <div>派单时间</div>
          <div>（本期/同比/环比）</div>
        </template>
      </el-table-column>
      <el-table-column prop="name3" align="center" width="150">
        <template slot="header" slot-scope="scope">
          <div>截单数量</div>
          <div>（本期/同比/环比）</div>
        </template>
      </el-table-column>
      <el-table-column prop="name4" align="center" width="150">
        <template slot="header" slot-scope="scope">
          <div>派单数量</div>
          <div>（本期/同比/环比）</div>
        </template>
      </el-table-column>
      <el-table-column prop="name5" align="center" width="150">
        <template slot="header" slot-scope="scope">
          <div>用车数量</div>
          <div>（本期/同比/环比）</div>
        </template>
      </el-table-column>
      <el-table-column prop="name6" align="center" width="150">
        <template slot="header" slot-scope="scope">
          <div>维护费用</div>
          <div>（本期/同比/环比）</div>
        </template>
      </el-table-column>
      <el-table-column prop="name7" align="center" width="200">
        <template slot="header" slot-scope="scope">
          <div>单点维护成本</div>
          <div>（维护费用/报修点位总数）</div>
        </template>
      </el-table-column>
      <el-table-column prop="name8" align="center" width="200">
        <template slot="header" slot-scope="scope">
          <div>单人维护效率</div>
          <div>（报修点位总数/用工人数）</div>
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
    return {
      loading: false,
      projectList: [],
      List: [],
      form: {},
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
    // 监控项目变更
    handleProjectChange(val) {
      this.form = {
        project_code: val.projectCode,
        project_id: val.id,
        project_name: val.projectName,
      };
      this.List = [];
    },
    // 点击搜索
    handleQuery() {
      console.log(this.form);
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

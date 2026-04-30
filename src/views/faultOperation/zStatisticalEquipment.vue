<template>
  <div class="faultoperastatisticalpoint" v-loading="loading">
    <el-form size="small" inline label-width="80px">
      <el-form-item label="项目">
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
      <el-form-item label="区域">
        <el-input
          v-model="form.name2"
          placeholder="默认所有区域"
          clearable
          size="small"
          style="width: 220px"
        ></el-input>
      </el-form-item>
      <el-form-item label="子系统">
        <el-input
          v-model="form.name3"
          placeholder="默认所有子系统"
          clearable
          size="small"
          style="width: 220px"
        ></el-input>
      </el-form-item>
      <el-form-item label="点位">
        <el-input
          v-model="form.name4"
          placeholder="默认所有点位"
          clearable
          size="small"
          style="width: 220px"
        ></el-input>
      </el-form-item>
      <el-form-item label="维修类型">
        <el-input
          v-model="form.name5"
          placeholder="默认所有维修类型"
          clearable
          size="small"
          style="width: 220px"
        ></el-input>
      </el-form-item>
      <el-form-item label="故障定性">
        <el-input
          v-model="form.name6"
          placeholder="默认所有故障定性"
          clearable
          size="small"
          style="width: 220px"
        ></el-input>
      </el-form-item>
      <el-form-item label="维修单位">
        <el-input
          v-model="form.name7"
          placeholder="默认所有维修单位"
          clearable
          size="small"
          style="width: 220px"
        ></el-input>
      </el-form-item>
      <el-form-item label="报修次数">
        <el-select style="width: 60px" v-model="form.name81">
          <el-option
            v-for="item in rangeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-input
          v-model="form.name8"
          placeholder="默认所有报修次数"
          clearable
          size="small"
          style="width: 160px"
        ></el-input>
      </el-form-item>
      <el-form-item label="维修时间">
        <el-date-picker
          v-model="form.name9"
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
        <el-button type="primary">查询</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </el-form>
    <el-table border :data="tableData">
      <el-table-column type="index" label="序号" width="50"> </el-table-column>
      <el-table-column prop="name1" label="项目名称"></el-table-column>
      <el-table-column prop="name1" label="区域" width="100"></el-table-column>
      <el-table-column
        prop="name1"
        label="子系统"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="name1"
        label="点位编码"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="name1"
        label="点位名称"
        width="210"
      ></el-table-column>
      <el-table-column
        prop="name1"
        label="设备名称"
        width="210"
      ></el-table-column>
      <el-table-column
        prop="name1"
        label="设备ip"
        width="150"
      ></el-table-column>
      <el-table-column prop="name1" label="状态" width="80"></el-table-column>
      <el-table-column
        prop="name1"
        label="报障数量"
        width="100"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "faultoperastatisticalequipment",
  data() {
    return {
      loading: false,
      form: {
        name81: 1,
      },
      rangeList: [
        { value: 1, label: ">=" },
        { value: 2, label: "=" },
        { value: 3, label: "<=" },
      ],
      tableData: [],
    };
  },
  created() {},
  mounted() {},
  components: {},
  methods: {},
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

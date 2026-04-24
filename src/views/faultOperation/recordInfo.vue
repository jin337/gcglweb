<template>
  <div class="record_info">
    <el-descriptions>
      <el-descriptions-item label="设备名称">{{
        info.device_name
      }}</el-descriptions-item>
      <el-descriptions-item label="设备IP">{{ info.ip }}</el-descriptions-item>
      <el-descriptions-item label="点位名称">{{
        info.point_name
      }}</el-descriptions-item>
      <el-descriptions-item label="点位编码">{{
        info.point_code
      }}</el-descriptions-item>
    </el-descriptions>
    <div class="num">报修次数：{{ baseTable?.length }}</div>
    <el-table border :data="baseTable">
      <el-table-column
        type="index"
        align="center"
        width="60"
        label="序号"
      ></el-table-column>
      <el-table-column
        prop="point_code"
        label="点位编码"
        width="120"
      ></el-table-column>
      <el-table-column prop="fault_category_name" label="故障类别">
      </el-table-column>
      <el-table-column prop="handle_remark" label="故障原因"></el-table-column>
      <el-table-column prop="handle_unit" label="维护单位"></el-table-column>
      <el-table-column prop="create_time" label="派发时间" width="160">
        <template v-slot="{ row }">
          <span>{{ row.create_time ? parseTime(row.create_time) : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="handle_time" label="修复时间" width="160">
        <template v-slot="{ row }">
          <span>{{ row.handle_time ? parseTime(row.handle_time) : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="photo_list"
        label="修复照片"
        width="100"
        align="center"
      >
        <template v-slot="{ row }">
          <div class="hand" @click="handlePreview(row)">
            {{ row?.photo_list?.length || 0 }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="echart-wrap">
      <el-card shadow="never" class="left">
        <div slot="header">
          <span>故障类型统计（{{ leftmenu[leftActive]?.name }}）</span>
          <el-button style="float: right" type="text" @click="switchType"
            >切换</el-button
          >
        </div>
        <!-- 表格 -->
        <el-table border :data="tableOne" v-show="leftActive == 0">
          <el-table-column type="index" align="center" width="50" label="序号">
          </el-table-column>
          <el-table-column prop="name" label="故障类别"></el-table-column>
          <el-table-column
            prop="value"
            label="数量"
            align="center"
            width="60"
          ></el-table-column>
        </el-table>

        <!-- 饼状图 -->
        <div class="echart-box" ref="chartBox1" v-show="leftActive == 1"></div>
        <!-- 柱状图 -->
        <div class="echart-box" ref="chartBox2" v-show="leftActive == 2"></div>
      </el-card>
      <el-card shadow="never" class="right">
        <div slot="header">
          <span>报修趋势图</span>
          <!-- <el-button style="float: right" type="text" @click="switchTime">{{
            rightmenu[rightActive]?.name
          }}</el-button> -->
        </div>
        <div class="echart-box" ref="chartBox3"></div>
      </el-card>
    </div>

    <!-- 图片预览 -->
    <viewer :images="previewImages" ref="viewer">
      <img
        v-for="(img, index) in previewImages"
        :src="img.filePath"
        :key="index"
        style="display: none"
      />
    </viewer>
  </div>
</template>

<script>
import { parseTime } from "@/utils/tool";
import * as echarts from "echarts";
export default {
  name: "record_info",
  props: {
    info: {
      type: Object,
    },
    id: {
      type: Number,
    },
  },

  data() {
    return {
      baseTable: [],
      tableOne: [],
      leftmenu: [
        {
          key: 1,
          name: "列表",
        },
        {
          key: 2,
          name: "饼状图",
        },
        {
          key: 3,
          name: "柱状图",
        },
      ],
      leftActive: 0,
      rightmenu: [
        {
          key: 1,
          name: "近一年",
        },
        {
          key: 2,
          name: "近三个月",
        },
        {
          key: 3,
          name: "近一个月",
        },
      ],
      rightActive: 0,

      chartData1: null,
      chartData2: null,
      chartData3: null,

      chartInstance1: null,
      chartInstance2: null,
      chartInstance3: null,
      // 预览的图片数组
      previewImages: [],
    };
  },
  computed: {},
  mounted() {},
  // 组件销毁时释放资源
  beforeDestroy() {
    if (this.chartInstance1) this.chartInstance1.dispose();
    if (this.chartInstance2) this.chartInstance2.dispose();
    if (this.chartInstance3) this.chartInstance3.dispose();
  },
  watch: {
    id: {
      handler(val) {
        this.$nextTick(() => {
          this.init();
        });
      },
      immediate: true,
    },
  },
  methods: {
    parseTime,
    async init() {
      this.leftActive = 0;
      this.rightActive = 0;

      this.getData(1);
    },
    async getData(type) {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });

      const params = {
        project_code: this.info.project_code,
        point_code: this.info.point_code,
        ip: this.info.ip,
        type: type, //1 年 2 三个月 3 一个月
      };
      const { code, data, message } = await this.$pub.post(
        "/point/order/detail-by-ip",
        params
      );
      if (code == 200) {
        this.baseTable = data?.base_data || [];
        this.tableOne = data?.chart_1 || [];
        this.chartData1 = data?.chart_2 || null;
        this.chartData2 = data?.chart_3 || null;
        this.chartData3 = data?.chart_4 || null;

        this.$nextTick(() => {
          this.showBox1();
          this.showBox2();
          this.showBox3();
        });
      } else {
        this.$notify.error({
          title: "查询失败",
          message: message,
        });
      }
      loading.close();
    },
    // 点击处理记录按钮
    handlePreview(row) {
      if (row.photo_list && row.photo_list.length > 0) {
        this.previewImages = row.photo_list;
        this.$nextTick(() => {
          this.$refs.viewer.$viewer.show();
        });
      } else {
        this.$message.warning("没有可预览的图片");
      }
    },
    switchType() {
      let len = this.leftmenu?.length;
      this.leftActive = (this.leftActive + 1) % len;

      this.$nextTick(() => {
        this.showBox1();
        this.showBox2();
      });
    },
    switchTime() {
      let len = this.rightmenu?.length;
      this.rightActive = (this.rightActive + 1) % len;

      this.getData(this.rightActive + 1);
    },
    showBox1() {
      const chartDom = this.$refs.chartBox1;
      if (!chartDom) return;

      if (this.chartInstance1) {
        this.chartInstance1.resize();
        // 这里可以更新数据
      } else {
        this.chartInstance1 = echarts.init(chartDom);
      }

      const option = {
        animation: false,
        tooltip: {
          trigger: "item",
        },
        legend: {
          bottom: "5%",
          left: "center",
        },
        series: [
          {
            type: "pie",
            radius: "70%",
            center: ["50%", "40%"],
            data: this.chartData1 || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };

      this.chartInstance1.setOption(option);
    },
    showBox2() {
      const chartDom = this.$refs.chartBox2;
      if (!chartDom) return;

      if (this.chartInstance2) {
        this.chartInstance2.resize();
      } else {
        this.chartInstance2 = echarts.init(chartDom);
      }

      const option = {
        animation: false,
        tooltip: {
          trigger: "item",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: this.chartData2?.title || [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.chartData2?.value || [],
            type: "bar",
          },
        ],
      };

      this.chartInstance2.setOption(option);
    },
    showBox3() {
      const chartDom = this.$refs.chartBox3;
      if (!chartDom) return;

      if (this.chartInstance3) {
        this.chartInstance3.resize();
      } else {
        this.chartInstance3 = echarts.init(chartDom);
      }

      const option = {
        animation: false,
        tooltip: {
          trigger: "item",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: this.chartData3?.title || [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.chartData3?.value || [],
            type: "line",
          },
        ],
      };

      this.chartInstance3.setOption(option);
    },
  },
};
</script>

<style lang="scss">
.record_info {
  .num {
    margin-bottom: 12px;
  }
  .hand{
    cursor: pointer;
    color:#409EFF;
  }
  .echart-wrap {
    margin-top: 12px;
    display: flex;
    gap: 12px;
    .left {
      width: 40%;
    }
    .right {
      width: 60%;
    }
    .echart-box {
      width: 100%;
      height: 400px;
    }
  }
}
</style>

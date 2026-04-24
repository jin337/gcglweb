<!--
 * @Descripttion: 点击合同数进来，修改对应区域的数量
 * @version: 1.0
 * @Author: Clover_yuan
 * @Date: 2024-02-04 09:30:08
 * @LastEditors: Clover_yuan
 * @LastEditTime: 2024-02-04 16:22:45
-->
<template>
  <div class="contractedit" v-loading="loading">
    <div class="vux-flexbox topwrap">
      <div class="vux-flexbox vux-flex-row">
        <h3>合同数量:</h3>
        <span style="margin-left:10px;font-size:18px;">{{ currentRow.contract_nums }}</span>
      </div>
      <div class="vux-flexbox vux-flex-row">
        <h3>区域合计:</h3>
        <span style="margin-left:10px;font-size:18px;">{{ summary }}</span>
      </div>
    </div>
    <el-row style="margin-top: 20px;" class="brief">
      <el-col :span="8" v-for="row in tableData" :key="row.id" class="brief-item ">
        <div class="title">{{ row.contract_area }}</div>
        <div class="value">
          <el-input v-if="row.isedit" v-model="row.contract_count" v-focus placeholder="请输入数量" style="width:100%;"
            @blur="updateNum(row)" size="small" />
          <div class="clickbg" v-else @click="clickNum(row)">{{ row.contract_count }}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'contractedit',
  props: {
    project_code: {
      required: true
    },
    currentRow: {
      required: true
    }
  },
  data () {
    return {
      loading: false,
      tableData: [],
      summary: 0
    }
  },
  mounted () {
    this.getList()
  },
  directives: {
    focus: {
      inserted (el) {
        el.querySelector('input').focus()
      }
    }
  },
  methods: {
    async getList () {
      this.loading = true
      const params = {
        device_id: this.currentRow.id,
        project_code: this.project_code
      }
      const { data, code, message } = await this.$pub.post('device/contract/list', params)
      this.loading = false
      if (code !== 200) {
        this.$message({
          type: 'error',
          message: message || '获取列表失败',
          showClose: true
        })
        return
      }
      this.tableData = (data.area_list || []).map(m => {
        return {
          ...m, isedit: false, precontract_count: ''
        }
      })
      this.summary = data.summary
      this.loading = false
    },
    updateNum (row) {
      var reg = /^([0-9][0-9]*)$/
      if (row.contract_count === row.precontract_count) {
        row.isedit = false
        return true
      } else if (reg.test(row.contract_count + '')) {
        this.loading = true
        const params = {
          device_id: this.currentRow.id,
          project_code: this.project_code,
          contract_area: row.contract_area,
          device_type: this.currentRow.device_type,
          contract_count: row.contract_count + ''
        }
        this.$pub.post('device/contract/save', params).then(code => {
          this.loading = false
          if (code === 200) {
            this.$message({
              type: 'success',
              message: '更新数量成功',
              showClose: true
            })
            row.isedit = false
          }
        }).finally(() => {
          this.loading = false
          this.getList()
        })
      } else {
        this.$message({
          type: 'error',
          message: '请输入正整数',
          showClose: true
        })
      }
    },
    clickNum (row) {
      row.isedit = true
      row.precontract_count = row.contract_count
    }
  }
}
</script>

<style scoped>
.contractedit {
  .topwrap {
    justify-content: space-between;
  }

  .brief {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;

    .brief-item {
      width: calc(33% - 16px);
      margin: 8px;
      cursor: pointer;
      border-radius: 3px;
      box-shadow: 0 1px 1px rgba(9, 30, 66, .25), 0 0 1px rgba(9, 30, 66, .31);
      padding: 20px 20px 10px;
      box-sizing: border-box;
    }

    .title {
      overflow: hidden;
      line-height: 20px;
      color: #5e6c84;
      white-space: nowrap;
    }

    .value {
      min-height: 32px;
      margin-top: 8px;
      overflow: hidden;
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
      width: 100%;
    }
  }
}
</style>

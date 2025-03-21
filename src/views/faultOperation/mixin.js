/*
 * @Author: y
 * @Date: 2025-03-07 13:45:22
 * @LastEditors: y
 * @LastEditTime: 2025-03-12 14:24:32
 * @FilePath: \gcgl_web\src\views\faultOperation\mixin.js
 */
export default {
  data () {
    return {
      // 人力数量校验规则
      workerQuantityRules: [
        { required: true, message: '请输入数量', trigger: 'blur' },
      ],
      // 车辆数量校验规则
      carQuantityRules: [
        { required: true, message: '请输入数量', trigger: 'blur' },
      ],

      // 工种选项
      workerList: [],

      // 车辆选择
      carList: []
    }
  },
  watch: {
    'form.selectedWorkers': {
      handler (newVal, oldVal) {
        this.handleSelectionChange(newVal, oldVal, 'workerQuantities');
      },
      deep: true, // 深度监听
    },
    'form.selectedCars': {
      handler (newVal, oldVal) {
        this.handleSelectionChange(newVal, oldVal, 'carQuantities');
      },
      deep: true, // 深度监听
    },
  },
  created () {
    this.getWork()
    this.getCar()
  },
  methods: {
    async getWork () {
      const { data, code } = await this.$pub.post('/point/order/dict-list', { type: 1 })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取数据出错了',
          showClose: true
        })
      }
      this.workerList = (data || []).map(m => {
        return {
          ...m, fullName: m.name + '(' + m.price + ')'
        }
      })
    },
    async getCar () {
      const { data, code } = await this.$pub.post('/point/order/dict-list', { type: 2 })
      if (code !== 200) {
        return this.$message({
          type: 'error',
          message: '获取数据出错了',
          showClose: true
        })
      }
      this.carList = (data || []).map(m => {
        return {
          ...m, fullName: m.name + '(' + m.price + ')'
        }
      })
    },
    // 根据 value 获取 name
    getWorkerName (value) {
      const worker = this.workerList.find((w) => w.value === value);
      return worker ? worker.name : '';
    },
    // 根据 value 获取 name
    getCarName (value) {
      const car = this.carList.find((w) => w.value === value);
      return car ? car.name : '';
    },
    // 选中的人力和车辆种类：通用的选择变化处理逻辑
    handleSelectionChange (newVal, oldVal, quantityKey) {
      // 1.找出取消选择的（工种或车辆），不然下一次再选中会带入之前输入的数量
      const removedItems = oldVal.filter((item) => !newVal.includes(item));
      removedItems.forEach((item) => {
        this.$delete(this.form[quantityKey], item);
      });
      // 2.初始化新选中的工种的数量为 1
      newVal.forEach((item) => {
        if (!this.form[quantityKey][item]) {
          this.$set(this.form[quantityKey], item, 1);
        }
      });
    },
    /**
   * List 中解析出 Quantities，并将其键提取到一个数组
   * @param {Array} List - List 数组
   * @returns {Object} - 解析出的 Quantities 对象   to:拿到后端数据整理一下前端用
   */
    parseQuantities (List) {
      const Quantities = {};
      const keys = [];
      List.forEach(item => {
        if (item.count > 0) {
          Quantities[item.value] = item.count; // 解析出 Quantities
          keys.push(item.value); // 将键提取到数组
        }
      });
      return { Quantities, keys };
    },
    /**
   * 将Quantities 中的数量分配到 List 的 count 属性
   * @param {Object} Quantities - 数量对象
   * @param {Array} List - 列表集合
   * @returns {Array} - 新的List 数组 ,to:前端给后端交互
   */
    assignWorker (Quantities, List) {
      const tempArr = []
      List.forEach(item => {
        const val = item.value; // 获取对应的类型
        if (Quantities.hasOwnProperty(val)) {
          item.count = Quantities[val]; // 分配数量到 count
          tempArr.push(item)
        }
      });
      return tempArr;
    }
  }
}

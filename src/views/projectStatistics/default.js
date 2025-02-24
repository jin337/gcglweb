export default {
  data() {
    return {
      area: 'all',
      areaList: [],
      index: 0,
      areaScrollWidth: 0,
      areaWidth: 0,
      isShowArrow: false,
      istoday: false
    }
  },
  created() {
    this.getAreaList()
  },
  methods: {
    async getAreaList() {
      try {
        this.areaList = [{ key: 'all', value: '全部' }]
        const { data, code, message } = await this.$pub.post(
          '/project/area-list',
          {
            project_id: this.project.project_id
          }
        )
        if (code === 200) {
          this.areaList = [...this.areaList, ...data] || this.areaList
          this.getAllAreaWidth()
        } else {
          this.$notify.error({
            title: '区域接口查询失败',
            message: message
          })
        }
      } catch (e) {
        this.$notify.error({
          title: '区域接口服务器请求失败',
          message: e.message
        })
      }
    },
    getAllAreaWidth() {
      this.$nextTick(() => {
        const _el = document.getElementsByClassName('p_t_wrap')
        if (_el[0]) {
          const btns_wrap = _el[0].getElementsByClassName('btns')[0]
          this.areaScrollWidth = btns_wrap.scrollWidth //中间区域连带滚动条在内的宽度
          this.areaWidth = btns_wrap.clientWidth
          if (this.areaScrollWidth > this.areaWidth) {
            this.isShowArrow = true
          } else {
            this.isShowArrow = false
          }
        }
      })
    },
    // ! 改变滚动距离,让想操作的区域在可视范围内
    changeScroll() {
      this.$nextTick(() => {
        const _el = document.getElementsByClassName('p_t_wrap')
        if (_el[0]) {
          const btns_wrap = _el[0].getElementsByClassName('btns')[0]
          const isActive = _el[0].getElementsByClassName('isActive')[0]

          const btns_wrap_width = btns_wrap.getBoundingClientRect().width //滚动区域容器宽度
          const isActive_width = isActive.getBoundingClientRect().width //当前元素宽度
          const _scrollleft = btns_wrap.scrollLeft //当前滚动条滚动距离
          const _offsetleft = isActive.offsetLeft + this.index //当前元素距离父级左侧

          // console.log(
          //   "当前元素距离父级左侧"+_left,
          //   "当前滚动条滚动距离"+_scrollleft,
          //   "距离父级左侧小于了滚动条滚动距离"+(_left - _scrollleft) ,
          //   "滚动条滚动距离小于距离父级左侧减掉了父级外宽宽度距离"+ (_left - btns_wrap_width)
          //   )

          if (
            _offsetleft < _scrollleft ||
            _scrollleft < _offsetleft - btns_wrap_width
          ) {
            btns_wrap.scrollLeft =
              _offsetleft - isActive_width > 0
                ? _offsetleft - isActive_width
                : _offsetleft
          }
        }
      })
    },
    clickArea(area, index) {
      this.area = area
      this.index = index
      if (!this.istoday) {
        this.getData()
      } else {
        this.getTableData()
      }
      this.changeScroll()
    },
    clickLeft() {
      if (this.index === 0) return
      const _index = this.index - 1
      const _area = this.areaList[_index].key
      this.clickArea(_area, _index)
    },
    clickRight() {
      if (this.index === this.areaList.length - 1) return
      const _index = this.index + 1
      const _area = this.areaList[_index].key
      this.clickArea(_area, _index)
    }
  }
}

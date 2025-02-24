export default {
  data(){
    return {
      showLngLat: false,
      showdirectNums: false,
      showArea: false,
      showInfo: false,
      showMany: false,//点击子系统 来源 状态

      click:{
        title: '',
        list:[],
        label: '',
        value:'',
        type: ''
      },
      permission: []
    }
  },
  methods: {
    editPointName(row){
      const h = this.$createElement;
      let inp_value = row.point_name;
      this.$msgbox({
        title: '修改点位名称',
        message: h('p', { style: 'display: flex',class: {'el-input':true,'el-input--mini':true}, }, [
          h('span', { style: 'width: 80px' }, '点位名称:'),
          h('input',{
            class: {'el-input__inner':true},
            domProps: {
              value: row.point_name,
            },
            on: {
              input: (event) => {
                inp_value = event.target.value;
              }
            }
          })
        ]),
        showCancelButton: true,
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            if(!inp_value){
              instance.confirmButtonLoading = false
              return this.$message({
                type: 'error',
                message: '请点位名称',
                showClose: true
              })
            }
            const params = {
              point_id: Number(row.point_id),
              point_code: row.point_code,
              point_name: inp_value
            }
            const {code} = await this.$pub.post("/point/manage/name-edit",params);
            if(code!==200){
              instance.confirmButtonLoading = false;
              return  this.$message({
                type: 'error',
                message: '修改点位名称失败',
                showClose: true
              })
            }
            done();
            setTimeout(() => {
              instance.confirmButtonLoading = false;
              this.handleQuery();
            }, 300);
          } else {
            done();
          }
        }
      }).catch(err=>{});
    },
    lnglatClick(row){
      this.showLngLat = true;
      this.currentp = row;
    },
    handlelnglatClose(done){
      if(this.$refs.lnglat && this.$refs.lnglat.$refs.bdMap){
       this.$refs.lnglat.$refs.bdMap.destroyed()
      }
      done()
    },
    directNumClick(row){
      this.currentp = row;
      this.showdirectNums = true
    },
    manyClick(row,type){
      this.currentp = row;
      if(type==='child_code'){
        this.click = {
          title: '子系统',
          list: this.child.list,
          label: 'value',
          value: 'key',
          type: 'child_code'
        }
        this.permission = ['points:childEdit']
      }else if(type==='origin'){
        this.click = {
          title: '来源',
          list: this.origin.list,
          label: 'origin_name',
          value: 'origin',
          type: 'origin'
        }
        this.permission = ['points:fromEdit']
      }else if(type==='status'){
        this.click = {
          title: '状态',
          list: this.status.list,
          label: 'status_name',
          value: 'status',
          type: 'status'
        }
        this.permission = ['points:statusEdit']
      }
      this.showMany = true;
    },
    manyClickShow(name,row,type){ 
      this.currentp = row;
      // var st1 = {}
      // st1.label = '未完成'
      // st1.value = '0'
      // var st2 = {}
      // st2.label = '已完成'
      // st2.value = '1'
      // var sList = []
      // sList.push(st1)
      // sList.push(st2)
      // this.click = {
      //   title: '完成状态',
      //   list: sList,
      //   label: 'label',
      //   value: 'value',
      //   type: 'complete_status',
      //   stage: name
      // } 
      // this.permission = ['points:statusEdit']
      // this.showMany = true;

      const tempList = [
        {value: '0',label:'未完成'},
        {value: '1',label:'已完成'}
      ]

      this.currentp.complete_status = (row[name] === '已完成' ? '1' : '0')
       this.click = {
        title: '完成状态',
        list: tempList,
        label: 'label',
        value: 'value',
        type: 'complete_status',
        stage: name
      } 
      this.permission = ['points:statusEdit']
      this.showMany = true;
     
    },

    showAreaDiao(row){
      this.showArea = true;
      this.currentp = row;
    },
    changeshowArea(){
      this.showArea = false;
 
      this.area.list = [];
      this.pointData = [];
      if(this.isGJsearch){
        Object.assign(this.area,{isIndeterminate: false,checkAll: false,checkedList: []});
      }
      this.getAreaList();

      this.handleQuery();

    },
    showInfoDrawer(row){
      this.currentp = row;
      this.showInfo = true;
    },
    copyM(row){
      const innerdata=document.getElementById("copy" + row.point_code);
      window.getSelection().selectAllChildren(innerdata); //选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      this.$message({
        type: 'success',
        message:'已复制好，可贴粘。',
        showClose: true
      })
    },
    // 编辑经纬度
    editM(row){
      this.editLnglatShow = true;
      this.currentp = row;
    },
    sureChange(val){
      const type = this.click.type
      if(type==='child_code'){
        this.sureChangeChild(val)
      }else if(type==='origin'){
        this.sureChangeOrigin(val)
      }else if(type==='status'){
        this.sureChangeStatus(val)
      }else if(type==='complete_status'){
        this.surePointStage(val,this.click.stage)
      }
    },
    async surePointStage(val,stage){
      const params = {
        project_code: this.form.project_code,
        point_code: this.currentp.point_code,
        oper_stage: stage,
        type: Number(val)
      }
      const {code} = await this.$pub.post('/point/stage/edit',params);
      if(code===200){
        this.$message({
          type: 'success',
          message:'修改阶段成功' ,
          showClose: true
        })
        this.showMany = false;
        this.handleQuery()
      }else{
        this.$message({
          type: 'error',
          message:'修改阶段失败' ,
          showClose: true
        })
        if(this.$refs.pubcontainer){
          this.$refs.pubcontainer.sureLoading=false
        }
      }
    },
    async sureChangeChild(val){
      const params = {
        project_code: this.form.project_code,
        point_code: this.currentp.point_code,
        point_id: Number(this.currentp.point_id),
        child_code: val
      }
      const {code} = await this.$pub.post('/point/manage/child-edit',params);
      if(code===200){
        this.$message({
          type: 'success',
          message:'修改子系统成功' ,
          showClose: true
        })
        this.showMany = false;
        this.handleQuery()
      }else{
        this.$message({
          type: 'error',
          message:'修改子系统失败' ,
          showClose: true
        })
        if(this.$refs.pubcontainer){
          this.$refs.pubcontainer.sureLoading=false
        }
      }
    },
    async sureChangeStatus(val){
      const params = {
        project_code: this.form.project_code,
        point_code: this.currentp.point_code,
        point_id: Number(this.currentp.point_id),
        status: Number(val)
      }
      const {code} = await this.$pub.post('/point/manage/status-edit',params);
      if(code===200){
        this.$message({
          type: 'success',
          message: '修改状态成功',
          showClose: true
        })
        this.showMany = false;
        this.handleQuery()
      }else{
        this.$message({
          type: 'error',
          message: '修改状态失败',
          showClose: true
        })        
        if(this.$refs.pubcontainer){
          this.$refs.pubcontainer.sureLoading=false
        }
      }
    },
    async sureChangeOrigin(val){
      const params = {
        project_code: this.form.project_code,
        point_code: this.currentp.point_code,
        point_id: Number(this.currentp.point_id),
        origin: Number(val)
      }
      const {code} = await this.$pub.post('/point/manage/origin-edit',params);
      if(code===200){
        this.$message({
          type: 'success',
          message: ' 修改点位来源成功',
          showClose: true
        })
        this.showMany = false;
        this.handleQuery()
      }else{
        this.$message({
          type: 'error',
          message: '点位来源修改失败',
          showClose: true
        })
        if(this.$refs.pubcontainer){
          this.$refs.pubcontainer.sureLoading=false
        }
      }
    },
    deletePoint(row){
      this.$confirm('是否确认删除数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.tableLoading = true
          const { code, message } = await this.$pub.post(' ', { id: row.id })
          this.tableLoading = false
          if (code === 200) {
            this.$message({
              type: 'success',
              message: message || '删除成功',
              showClose: true
            })
            this.handleQuery()
          } else {
            this.$message({
              type: 'error',
              message: message || '删除失败',
              showClose: true
            })
          }
        } catch (err) {
          this.tableLoading = false
        }
      }).catch(function () {})
    },
    // 编辑点位
    editPoint(row){
      this.addShow = true
      this.currentp = row
    }
  }
}

<template>
<div id="photoWrap" ref="photoWrapRef">
  <template v-if="!error">
    <div ref="containerRef" id="container" >
      <el-progress 
        v-if="loading"
        type="circle" 
        :percentage="percentage" 
        :width="200" 
        :format="()=>'loading...'" 
        color="#999"
      ></el-progress>
    </div>
    <div class="btns" v-if="!loading">
      <svg-icon  :icon-class="play" @click="togglePlay" :style="{background: isMove? 'hsla(0,0%,100%,.2)' : 'transparent'}"/>
      <svg-icon  icon-class="download" @click="download" />
      <svg-icon  :icon-class="fullscreen" @click="toggleFullscreen" :style="{background: isFull? 'hsla(0,0%,100%,.2)' : 'transparent'}" />
    </div>
  </template>
   <template v-else>
     <p>{{errMsg}}</p>
   </template>
</div>

</template>
<script>
import * as THREE from 'three'
import screenfull from 'screenfull'
import { Message } from 'element-ui' // 假设使用 Element UI

export default {
  name: 'panorama',
  props: {
    // bigImg: {
    //   required: true
    // }
  },
  data() {
    return {
      bigImg: require('../../assets/images/test1.jpg'),
      isMove: false,
      isFull: false,
      play: 'play',
      fullscreen: 'fullscreen-in',
      error: false,
      errMsg: '',
      loading: false,
      percentage: 5,
      timer: null,
      
      // 将 Three.js 核心对象存储为组件实例属性
      camera: null,
      renderer: null,
      scene: null,
      skyBox: null,
      animationFrameId: null // 用于保存 requestAnimationFrame 的ID
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.init()
      this.animate()
    })
  },
  methods: {
    // 全景图配置函数---------------
    init() {
      const _this = this
      this.loading = true
      this.timer = setInterval(() => {
        this.percentage += 5
        if (this.percentage >= 100) {
          this.percentage = 80
        }
      }, 100)

      // 使用 ref 获取 DOM 元素，更安全
      const container = this.$refs.containerRef
      const photoWrap = this.$refs.photoWrapRef
      
      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(photoWrap.offsetWidth, photoWrap.offsetHeight)

      // 创建场景
      this.scene = new THREE.Scene()
      // 创建相机
      this.camera = new THREE.PerspectiveCamera(75, photoWrap.offsetWidth / photoWrap.offsetHeight, 0.1, 100)
      this.camera.position.set(0, 0, 0.01)
      this.camera.lookAt(0, 0, 0)
      
      const material = new THREE.MeshBasicMaterial()
      const textureLoader = new THREE.TextureLoader()

      textureLoader.load(
        this.bigImg,
        (texture) => {
          this.timer && clearInterval(this.timer)
          this.timer = null
          this.percentage = 100

          // 清空容器并添加 Canvas
          if (container.firstChild) {
            container.removeChild(container.firstChild)
          }
          container.appendChild(this.renderer.domElement)
          
          this.loading = false
          material.map = texture
          
          // ⚠️ 修正：使用 THREE.SphereGeometry 替代 THREE.SphereBufferGeometry
          this.skyBox = new THREE.Mesh(
            new THREE.SphereGeometry(100, 100, 100),
            material
          )
          this.skyBox.rotation.set(0, 0.5 * Math.PI, 0)
          this.skyBox.geometry.scale(1, 1, -1)
          this.scene.add(this.skyBox)
        },
        undefined,
        (err) => {
          this.loading = false
          this.error = true
          this.timer && clearInterval(this.timer)
          this.errMsg = '全景图加载失败，请检查路径或跨域设置。'
        }
      )

      window.addEventListener('resize', this.onWindowResize, false)
      let bMouseDown = false
      let x = -1
      let y = -1
      
      // 使用箭头函数保持 this 上下文
      container.onmousedown = (event) => {
        event.preventDefault()
        x = event.clientX
        y = event.clientY
        bMouseDown = true
        this.isMove = false
        this.play = 'play'
      }
      container.onmouseup = (event) => {
        event.preventDefault()
        bMouseDown = false
      }
      container.onmousemove = (event) => {
        event.preventDefault()
        if (bMouseDown && this.skyBox) {
          this.skyBox.rotation.y += -0.005 * (event.clientX - x)
          this.skyBox.rotation.x += -0.005 * (event.clientY - y)
          if (this.skyBox.rotation.x > Math.PI / 2) {
            this.skyBox.rotation.x = Math.PI / 2
          }
          if (this.skyBox.rotation.x < -Math.PI / 2) {
            this.skyBox.rotation.x = -Math.PI / 2
          }
          x = event.clientX
          y = event.clientY
        }
      }
      container.onmousewheel = (event) => {
        event.preventDefault()
        if (event.wheelDelta !== 0 && this.camera) {
          this.camera.fov -= event.wheelDelta > 0 ? 1 : -1
          if (this.camera.fov > 120) {
            this.camera.fov = 120
          } else if (this.camera.fov < 30) {
            this.camera.fov = 30
          }
          this.camera.updateProjectionMatrix()
        }
      }
    },
    onWindowResize() {
      const photoWrap = this.$refs.photoWrapRef
      if (!this.camera || !this.renderer || !photoWrap) return
      
      const width = photoWrap.offsetWidth
      const height = photoWrap.offsetHeight
      
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    },
    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate)
      if (this.isMove && this.skyBox) {
        this.skyBox.rotation.y += Math.PI * 0.001
      }
      if (this.renderer && this.scene && this.camera) {
         this.renderer.render(this.scene, this.camera)
      }
    },
    // 自动旋转
    togglePlay() {
      this.isMove = !this.isMove
      this.play = this.isMove ? 'play-active' : 'play'
    },
    // 下载
    download() {
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = this.bigImg
      // 提取文件名
      const fileName = this.bigImg.substring(this.bigImg.lastIndexOf('/') + 1) || 'panorama.jpg'
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    //  全屏
    toggleFullscreen() {
      const photoWrap = this.$refs.photoWrapRef
      if (!screenfull.isEnabled) {
        Message({ // 替换为 Element UI 的 Message 组件
          message: '你的浏览器不支持',
          type: 'warning',
          showClose: true
        })
        return false
      }
      screenfull.toggle(photoWrap) // 确保全屏的是组件根元素
      
      // 监听只绑定一次，并在销毁时移除
      screenfull.on('change', this.changeFullScreen)
    },
    changeFullScreen() {
      const photoWrap = this.$refs.photoWrapRef
      if (screenfull.isFullscreen) {
        photoWrap.classList.add('psv-container--fullscreen')
      } else {
        photoWrap.classList.remove('psv-container--fullscreen')
        screenfull.off('change', this.changeFullScreen) // 退出全屏后移除监听
      }
      this.isFull = screenfull.isFullscreen
      this.fullscreen = this.isFull ? 'fullscreen-out' : 'fullscreen-in'
      this.onWindowResize() // 重新计算尺寸
    }
  },
  
  // 核心修改部分：彻底清理 Three.js 资源
  beforeDestroy() {
    this.isMove = false
    this.error = false
    this.errMsg = ''
    
    // 1. 停止动画和定时器
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.timer && clearInterval(this.timer)
    
    // 2. 移除 DOM 事件
    window.removeEventListener('resize', this.onWindowResize)
    screenfull.off('change', this.changeFullScreen)
    
    // 3. 彻底释放 WebGL/GPU 资源（防止内存堆积的关键）
    if (this.scene) {
      this.scene.traverse((child) => {
        // 释放几何体
        if (child.geometry) {
          child.geometry.dispose()
        }
        // 释放材质和纹理
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => {
              if (m.map) m.map.dispose()
              m.dispose()
            })
          } else {
            if (child.material.map) child.material.map.dispose()
            child.material.dispose()
          }
        }
      })
    }
    
    // 4. 释放渲染器资源
    if (this.renderer) {
      this.renderer.dispose() // 释放 WebGL 上下文和 GPU 资源
      // 移除 canvas 元素
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
      }
    }

    // 5. 清空实例引用
    this.camera = null
    this.renderer = null
    this.scene = null
    this.skyBox = null
  }
}
</script>

<style lang="scss">
.photo_wrap{
  margin-bottom:0;
 .el-drawer__body{
    height:calc(100% - 45px);
  }
  .el-dialog__body{
    height: 70vh;
  }
}
.psv-container--fullscreen {
  position: fixed!important;
  height:100vh!important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
#photoWrap {
  width: 100%;
  height: 100%;
  position:relative;
  #container{
    width:100%;
    height:100%;
  }
  .btns{
    display: flex;
    position: absolute;
    z-index: 90;
    bottom: 0px;
    left: 0;
    width: 100%;
    height: 40px;
    background: rgba(61,61,61,.5);
    transition: bottom .1s ease-in-out;
    overflow: hidden;
    .svg-icon{
      width: 25px;
      height: 25px;
      padding: 7.5px;
      cursor: pointer;
      background: transparent;
      color: hsla(0,0%,100%,.7);
      &:hover {
        transform: scale(1.2);
      }
    }
  }
  .el-progress{
    width:100%;
    height:100%;
  }
  .el-progress-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -100px;
    margin-left:-100px;
  }
}

</style>
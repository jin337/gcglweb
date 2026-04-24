/*
 * @Author: yuanyuan
 * @Date: 2024-07-24 13:30:04
 * @LastEditors: yuanyuan
 * @LastEditTime: 2024-08-29 09:40:39
 * @FilePath: \gcgl_web\src\main.js
 */
import Vue from "vue";
import App from "./App";
// import router from "./router/indexs";
import router from "./router/routers";
import store from "./store";
import Storage from "vue-ls";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Viser from "viser-vue";
// @ts-ignore
import config from "@/config/config.js";
import { pub } from "./ajax/pub";
import "./router/index";
import "viewerjs/dist/viewer.css";
// @ts-ignore
import Viewer from "v-viewer";
import "./assets/iconfont/iconfont.css";
import "./assets/style/public.scss";
// @ts-ignore
import fn from "@/utils/ruoyi.js";
// @ts-ignore
import componentsInstall from "@/components/index.js";
import "./assets/icons";
import permission from "./utils/permission";
// @ts-ignore
import AFTableColumn from "af-table-column";
import Fragment from "vue-fragment";
// @ts-ignore
import { getDictData } from "@/utils/tool.js";
import "xe-utils";
import VXETable from "vxe-table";
import "vxe-table/lib/style.css";
import directive from "./utils/directive";

Vue.prototype.$pub = pub;
Vue.prototype.$fn = fn;
Vue.prototype.$dict = getDictData;

Vue.use(ElementUI);
Vue.use(Viser);
Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 99999999,
  },
});
Vue.use(Fragment.Plugin);

Vue.use(Storage, config.storageOptions);
Vue.use(componentsInstall);
Vue.use(permission);
Vue.use(AFTableColumn);
Vue.use(VXETable);
Vue.config.productionTip = false;

// 获取浏览器的访问地址并根据它设置变量
const apiurl = window.location.origin;
Vue.prototype.$apiUrl = apiurl || process.env.VUE_APP_BASE_URL;

directive(Vue);
/* eslint-disable no-new */
window.vm = new Vue({
  router,

  store,
  render: (h) => h(App),
}).$mount("#app");

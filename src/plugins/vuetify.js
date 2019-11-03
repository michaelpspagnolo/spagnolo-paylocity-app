import Vue from 'vue';
import Vuetify, { VTextField } from 'vuetify/lib';
import currency from 'v-currency-field'
 
import 'v-currency-field/dist/index.css'

Vue.use(Vuetify, {
  components: {
    VTextField
  }
})
Vue.use(currency);



export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});

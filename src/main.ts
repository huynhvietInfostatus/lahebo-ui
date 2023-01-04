import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/tailwind.css'
import 'vue-select/dist/vue-select.css'
import 'vue-toastification/dist/index.css'
import 'vue-loading-overlay/dist/vue-loading.css'
import '@vuepic/vue-datepicker/dist/main.css'
import 'vue3-tel-input/dist/vue3-tel-input.css'
import './assets/styles/custom.css'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AppModal from '@/core/components/AppModal.vue'
import ConfirmModal from '@/core/components/ConfirmModal.vue'
import AppButton from '@/core/components/AppButton.vue'
import PageHeader from '@/core/components/PageHeader.vue'
import RiskExposure from '@/core/components/RiskExposure.vue'
import SortableTableHead from '@/core/components/SortableTableHead.vue'
import LahInput from '@/core/components/LahInput.vue'
import AppStatusComp from '@/core/components/AppStatusComp.vue'

import router from './router'
import pinia from './store/pinia'
import Toast from 'vue-toastification'
// @ts-ignore
import VueTelInput from 'vue3-tel-input'
import '@/core/helpers/api-interceptor'
import '@/core/configs/icon-config'
import riskColorDirective from './core/directives/risk-color.directive'
import phoneNumberDirective from '@/core/directives/phone-number.directive'
import { VTooltip } from 'floating-vue'
import 'floating-vue/dist/style.css'
import { maska } from 'maska'
import vSelect from 'vue-select'
import OpenIndicator from '@/core/components/OpenIndicator.vue'
import Deselect from '@/core/components/DeSelectIndicator.vue'
import appPermissionDirective from './core/directives/app-permission.directive'
;(vSelect.props.components as unknown as any).default = () => ({
  OpenIndicator,
  Deselect
})
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import appRoleDirective from './core/directives/app-role.directive'

const VueTelInputOptions = {
  mode: 'international',
  defaultCountry: 'AU',
  preferredCountries: ['AU'],
  validCharactersOnly: false,
  styleClasses: ['form-input']
}

const filterBeforeCreate = (toast: any, toasts: any) => {
  if (toasts.filter((t: any) => t.type === toast.type).length !== 0) {
    // Returning false discards the toast
    return false
  }
  // You can modify the toast if you want
  return toast
}

// remove logs
if (import.meta.env.ENV !== 'dev') {
  console.log = () => {}
  console.error = () => {}
  console.debug = () => {}
}

const app = createApp(App)
app.use(router)
app.use(Toast, { timeout: 2000, filterBeforeCreate })
app.use(VueTelInput, VueTelInputOptions)
app.component('VueSelect', vSelect)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.component('AppModal', AppModal)
app.component('ConfirmModal', ConfirmModal)
app.component('AppButton', AppButton)
app.component('PageHeader', PageHeader)
app.component('RiskExposure', RiskExposure)
app.component('SortableTableHead', SortableTableHead)
app.component('LahInput', LahInput)
app.component('AppStatus', AppStatusComp)
app.directive('RiskColor', riskColorDirective)
app.component('Datepicker', Datepicker)
app.use(pinia)

// directive
app.directive('tooltip', VTooltip)
app.directive('maska', maska)
app.directive('PhoneNumber', phoneNumberDirective)
app.directive('AppPermission', appPermissionDirective)
app.directive('AppRole', appRoleDirective)
app.mount('#app')

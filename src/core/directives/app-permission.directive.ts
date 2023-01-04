import { hasPermission } from '../helpers/common'

export default {
  created(el: any, binding: any) {
    if (!hasPermission(binding.value ?? [])) {
      el.style.display = 'none'
    }
  }
}

import { loadStripe } from '@stripe/stripe-js'
import { apiUrl } from './../configs/api-config'
import axios from 'axios'

export class PaymentService {
  stripe: any
  constructor() {
    this.init()
  }
  async init() {
    this.stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY)
  }

  getPriceList() {
    return axios.get(`${apiUrl}/payment/prices`)
  }
  getProductList() {
    return axios.get(`${apiUrl}/payment/products`)
  }
  getInvoices() {
    return axios.get(`${apiUrl}/payment/invoices`)
  }
  unsubscribe() {
    return axios.post(`${apiUrl}/payment/unsubscribe`)
  }
  getCheckoutSession(payload: any) {
    return axios.post(`${apiUrl}/payment/checkout-sessions`, payload)
  }
  getCurrentSubscription() {
    return axios.get(`${apiUrl}/payment/subscription`)
  }
  updateSubscription(id: string) {
    return axios.patch(`${apiUrl}/payment/subscription`, { priceId: id })
  }
  addUpcomingInvoice(id: string) {
    return axios.post(`${apiUrl}/payment/subscription/upcoming-invoice`, { priceId: id })
  }

  async redirectToCheckout(options: any = {}) {
    if (!this.stripe) await this.init()
    return this.stripe.redirectToCheckout(options).then((res: any) => {
      console.log(res)
      return res
    })
  }
}

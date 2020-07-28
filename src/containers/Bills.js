import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from '../app/format.js'
import Logout from './Logout.js'

export const filterBills = (bills, userEmail) => {
	return bills.filter((bill) => bill.email === userEmail)
}

export default class {
	constructor({ document, onNavigate, firestore, localStorage }) {
		this.document = document
		this.onNavigate = onNavigate
		this.firestore = firestore
		const buttonNewBill = document.querySelector(
			`button[data-testid="btn-new-bill"]`
		)
		if (buttonNewBill)
			buttonNewBill.addEventListener('click', this.handleClickNewBill)
		const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
		if (iconEye)
			iconEye.forEach((icon) => {
				icon.addEventListener('click', (e) => this.handleClickIconEye(icon))
			})
		new Logout({ document, localStorage, onNavigate })
	}

	handleClickNewBill = (e) => {
		this.onNavigate(ROUTES_PATH['NewBill'])
	}

	handleClickIconEye = (icon) => {
		const billUrl =
			typeof icon.getAttribute === 'function'
				? icon.getAttribute('data-bill-url')
				: null
		$('#modaleFile').find('.modal-body').html(`<img src=${billUrl} />`)
		if (typeof $('#modaleFile').modal === 'function')
			$('#modaleFile').modal('show')
	}

	getBills = () => {
		const userEmail = localStorage.getItem('user')
			? JSON.parse(localStorage.getItem('user')).email
			: ''
		if (this.firestore) {
			return this.firestore
				.bills()
				.get()
				.then((snapshot) => {
					const bills = snapshot.docs.map((doc) => ({
						...doc.data(),
						date: formatDate(doc.data().date),
						status: formatStatus(doc.data().status)
					}))
					return filterBills(bills, userEmail)
				})
				.catch((error) => {
					return error
				})
		}
	}
}

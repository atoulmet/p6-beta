import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBillableIcon from '../assets/svg/big_billable.js'
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from './Logout.js'

export const filteredBills = (data, status) => {
	return data && data.length
		? data
			.filter((bill) => {
				return bill.status === status
			})
			.sort((a, b) => (a.ISOdate > b.ISOdate ? 1 : -1))
		: []
}

export const card = (bill) => {
	const firstAndLastNames = bill.email.split('@')[0]
	const firstName = firstAndLastNames.includes('.')
		? firstAndLastNames.split('.')[0]
		: ''
	const lastName = firstAndLastNames.includes('.')
		? firstAndLastNames.split('.')[1]
		: firstAndLastNames

	return `
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${
		bill.id
		}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `
}

export const cards = (bills) => {
	return bills && bills.length ? bills.map((bill) => card(bill)).join('') : ''
}

export const getStatus = (index) => {
	switch (index) {
		case 1:
			return 'pending'
		case 2:
			return 'accepted'
		case 3:
			return 'refused'
	}
}

export default class {
	constructor({ document, onNavigate, firestore, bills, localStorage }) {
		this.document = document
		this.onNavigate = onNavigate
		this.firestore = firestore
		$('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
		$('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
		$('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
		this.getBillsAllUsers()
		new Logout({ localStorage, onNavigate })
	}

	handleClickIconEye = () => {
		const billUrl = $('#icon-eye-d').attr('data-bill-url')
		$('#modaleFileAdmin1').find('.modal-body').html(`<img src=${billUrl} />`)
		console.log(typeof $('#modaleFileAdmin1').modal)
		if (typeof $('#modaleFileAdmin1').modal === 'function')
			$('#modaleFileAdmin1').modal('show')
	}

	handleEditTicket(e, bill, bills) {
		if (this.counter === undefined || this.id !== bill.id) this.counter = 0
		if (this.id === undefined || this.id !== bill.id) this.id = bill.id
		if (this.counter % 2 === 0) {
			bills.forEach((b) => {
				$(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
			})
			$(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
			$('.dashboard-right-container div').html(DashboardFormUI(bill))
			$('.vertical-navbar').css({ height: '150vh' })
			this.counter++
		} else {
			$(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

			$('.dashboard-right-container div').html(`
        <div id="big-billable-icon"> ${BigBillableIcon} </div>
      `)
			$('.vertical-navbar').css({ height: '120vh' })
			this.counter++
		}
		$('#icon-eye-d').click(this.handleClickIconEye)
		$('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
		$('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
	}

	handleAcceptSubmit = (e, bill) => {
		const newBill = {
			...bill,
			status: 'accepted',
			commentAdmin: $('#commentary2').val()
		}
		this.updateBill(newBill)
		this.onNavigate(ROUTES_PATH['Dashboard'])
	}

	handleRefuseSubmit = (e, bill) => {
		const newBill = {
			...bill,
			status: 'refused',
			commentAdmin: $('#commentary2').val()
		}
		this.updateBill(newBill)
		this.onNavigate(ROUTES_PATH['Dashboard'])
	}

	handleShowTickets(e, bills, index) {
		if (this.counter === undefined || this.index !== index) this.counter = 0
		if (this.index === undefined || this.index !== index) this.index = index
		if (this.counter % 2 === 0) {
			$(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' })
			$(`#status-bills-container${this.index}`).html(
				cards(filteredBills(bills, getStatus(this.index)))
			)
			this.counter++
		} else {
			$(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' })
			$(`#status-bills-container${this.index}`).html('')
			this.counter++
		}

		bills.forEach((bill) => {
			$(`#open-bill${bill.id}`).click((e) =>
				this.handleEditTicket(e, bill, bills)
			)
		})

		return bills
	}

	getBillsAllUsers = () => {
		if (this.firestore) {
			return this.firestore
				.bills()
				.get()
				.then((snapshot) => {
					const bills = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
						date: doc.data().date,
						status: doc.data().status
					}))
					return bills
				})
				.catch((error) => error)
		}
	}

	updateBill = (bill) => {
		if (this.firestore) {
			return this.firestore
				.bill(bill.id)
				.update(bill)
				.then((bill) => bill)
				.catch((error) => error)
		}
	}
}

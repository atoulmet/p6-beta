import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import BillsUI from '../views/BillsUI.js'
import Bills, { filterBills } from '../containers/Bills.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES } from '../constants/routes'
import firebase from '../__mocks__/firebase'

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		describe('When I click on the icon eye', () => {
			test('Then a modal should open', () => {
				const html = BillsUI({ data: [bills[0]] })
				document.body.innerHTML = html
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname })
				}

				const firestore = null
				const billView = new Bills({
					document,
					onNavigate,
					firestore,
					localStorage: window.localStorage
				})
				const handleClickIconEye = jest.fn(billView.handleClickIconEye)
				const eye = screen.getByTestId('icon-eye')
				eye.addEventListener('click', handleClickIconEye)
				userEvent.click(eye)
				expect(handleClickIconEye).toHaveBeenCalled()
				const modale = screen.getByTestId('modaleFileEmployee')
				expect(modale).toBeTruthy()
			})
		})
		describe('When I click on new bill', () => {
			test('handleNewClick is called', () => {
				const html = BillsUI({ data: [bills[0]] })
				document.body.innerHTML = html
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname })
				}
				const firestore = null
				const billView = new Bills({
					document,
					onNavigate,
					firestore,
					localStorage: window.localStorage
				})
				const handleClickNewBill = jest.fn(billView.handleClickNewBill)
				const buttonNewBill = screen.getByTestId('btn-new-bill')
				buttonNewBill.addEventListener('click', handleClickNewBill)
				userEvent.click(buttonNewBill)
				expect(handleClickNewBill).toHaveBeenCalled()
			})
		})
		test('Then bills should be ordered from earliest to latest', () => {
			const html = BillsUI({ data: bills })
			document.body.innerHTML = html

			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
				)
				.map((a) => a.innerHTML)
			const antiChrono = (a, b) => (a < b ? 1 : -1)
			const datesSorted = [...dates].sort(antiChrono)
			expect(dates).toEqual(datesSorted)
		})

		describe('When I pass bills with other email address to filterBills', () => {
			test('Then the filtered bill list should be empty', () => {
				const filtered_bills = filterBills(bills, 'b@b.b')
				expect(filtered_bills.length).toBe(0)
			})
		})
		test('Then localStorage.getItem should be called', () => {
			const html = BillsUI({ data: bills })
			document.body.innerHTML = html
			Object.defineProperty(window, 'localStorage', {
				value: { getItem: jest.fn(() => null), setItem: jest.fn(() => null) }
			})
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
					email: 'b@b.b'
				})
			)
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname })
			}
			const firestore = null
			const billView = new Bills({
				document,
				onNavigate,
				firestore,
				localStorage: window.localStorage
			})
			const getBills = jest.fn(billView.getBills)

			getBills()
			expect(window.localStorage.getItem).toHaveBeenCalled()
			expect(window.localStorage.getItem).toHaveBeenCalledWith('user')
		})
		describe('When I am on Bills page but it is loading', () => {
			test('Then, Loading page should be rendered', () => {
				const html = BillsUI({ loading: true })
				document.body.innerHTML = html
				expect(screen.getAllByText('Loading...')).toBeTruthy()
			})
		})

		describe('When I am on Bills page but back-end send an error message', () => {
			test('Then, Error page should be rendered', () => {
				const html = BillsUI({ error: 'some error message' })
				document.body.innerHTML = html
				expect(screen.getAllByText('Erreur')).toBeTruthy()
			})
		})

		test('fetches bills from mock API GET', async () => {
			const getSpy = jest.spyOn(firebase, 'get')
			const billsTest = await firebase.get()
			expect(getSpy).toHaveBeenCalledTimes(1)
			expect(billsTest.data.length).toBe(4)
		})
		test('fetches bills from an API and fails with 404 message error', async () => {
			firebase.get.mockImplementationOnce(() =>
				Promise.reject(new Error('Erreur 404'))
			)
			const html = BillsUI({ error: 'Erreur 404' })
			document.body.innerHTML = html
			const message = await screen.getByText(/Erreur 404/)
			expect(message).toBeTruthy()
		})
	})
})

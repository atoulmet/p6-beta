import { fireEvent, screen } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import firebase from '../__mocks__/firebase'

describe('Given I am connected as an employee on NewBill Page', () => {
	describe('When I do not fill fields and I click on submit', () => {
		test('Then form should still be rendered', () => {
			const html = NewBillUI()
			document.body.innerHTML = html

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname })
			}

			const firestore = null
			const newBillView = new NewBill({
				document,
				onNavigate,
				firestore,
				localStorage: window.localStorage.setItem(
					'user',
					JSON.stringify({
						type: 'Employee',
						email: 'b@b.b'
					})
				)
			})

			const form = screen.getByTestId('form-new-bill')
			const amount = screen.getByTestId('amount')
			expect(amount.value).toBe('')
			const handleSubmit = jest.fn(newBillView)
			handleSubmit.mockReturnValue({})
			form.addEventListener('submit', handleSubmit)
			fireEvent.submit(form)
			expect(handleSubmit).toHaveBeenCalled()
			expect(screen.getByTestId('form-new-bill')).toBeTruthy()
		})
	})

	describe('When I fill fields and I click on submit', () => {
		test('Then form should still be rendered', () => {
			const html = NewBillUI()
			document.body.innerHTML = html

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname })
			}

			const firestore = null
			const newBillView = new NewBill({
				document,
				onNavigate,
				firestore,
				localStorage: window.localStorage
			})

			const createBill = jest.fn(newBillView.createBill)
			createBill()

			expect(createBill).toHaveBeenCalled()
		})
	})
})

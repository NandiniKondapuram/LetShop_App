import { test } from '@playwright/test'
import { apiUtilities } from './APIUtilities.setup'
test.use({
    ignoreHTTPSErrors: true
})
let loginPayload = { userEmail: "Adya@gmail.com", userPassword: "Welcome@123" }
let orderPayload = {orders:[{country:"India",productOrderedId:"6960eac0c941646b7a8b3e68"}]}
let response: { token: string, orderId: string } = { token: "", orderId: "" }
test.beforeAll(async ({ browser }) => {
    const apiContext = await browser.newContext()
    const apiUtil = new apiUtilities(apiContext, loginPayload)
    response = await apiUtil.orders(orderPayload)
})
test('Order the product', async ({ page }) => {
    console.log(response.token)
    await page.addInitScript((value) => {
        window.localStorage.setItem('token', value)
    }, response.token)
    await page.goto('https://rahulshettyacademy.com/client/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'ORDERS' }).waitFor()
    await page.route('**/api/ecom/order/get-orders-for-customer/*', async (route) => {
        const apiResponse = await route.fetch()
        const responseBody = await apiResponse.json()
        responseBody.data = []
        responseBody.message = 'No Orders'
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(responseBody)
        })
    })

    await Promise.all([
        page.waitForResponse(res => res.url().includes('/get-orders-for-customer/') && res.status() === 200),
        page.getByRole('button', { name: 'ORDERS' }).click()
    ])
})
import {  BrowserContext,request } from "@playwright/test";
export class apiUtilities{
    readonly apiContext:BrowserContext
    readonly loginPayLoad:{userEmail:string,userPassword:string}
    constructor(apiContext:BrowserContext,loginPayLoad:{userEmail:string,userPassword:string})
    {
        this.apiContext=apiContext
        this.loginPayLoad=loginPayLoad
    }
    async getToken()
    {
        const response=await this.apiContext.request.post('https://rahulshettyacademy.com/api/ecom/auth/login',{
            data:this.loginPayLoad
        })
        const response_body=await response.json()
        return await response_body.token
    }
    async orders(orderPayLoad:{orders:{country:string,productOrderedId:string}[]})
    {
        let response:{token:string,orderId:string}={token:"",orderId:""}
        response.token=await this.getToken()
        const orderResponse=await this.apiContext.request.post('https://rahulshettyacademy.com/api/ecom/order/create-order',{
         data:orderPayLoad,
            headers:{
            'Authorization':response.token
         }
        })
        const orderResponseBody=await orderResponse.json()
        const orders = orderResponseBody.orders
        const orderId = Array.isArray(orders)
            ? orders[0]?._id ?? orders[0]?.id ?? orders[0]
            : orders?._id ?? orders?.id ?? orderResponseBody.orderId ?? orderResponseBody.id ?? ''
        response.orderId = orderId
        return response
    }
}



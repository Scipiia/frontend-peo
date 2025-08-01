import { createRouter, createWebHistory } from "vue-router";
//import HelloWorld from "@/components/HelloWorld.vue";
import MessageForm from "@/components/MessageForm.vue";
import OrdersList from "@/components/OrdersList.vue";
import FormPagePeo from "@/components/FormSendPeo.vue";
import OrdersDetails from "@/components/OrdersDetails.vue";
import PrintNormOrder from "@/components/PrintNormOrder.vue";


const routes = [
    //{path : "/api/fff", component: HelloWorld},
    {path : "/api/message", component:  MessageForm},
    {path : "/api/orders/order/:id", name: "OrdersDetails" , component:  OrdersDetails, props: true},
    {path: "/api/orders/order/form/:id", name: "FormPagePeo", component: FormPagePeo},
    {path: "/api/master/orders/order/:id", name: "FormPrintNorm", component: PrintNormOrder},
    {path: "/api/orders", component: OrdersList}
];

const router = createRouter({
    history: createWebHistory(),
    routes
})
console.log('Registered routes:', router.getRoutes());

export default router;
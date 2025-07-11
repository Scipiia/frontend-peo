import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "@/components/HelloWorld.vue";
import MessageForm from "@/components/MessageForm.vue";
import OrdersList from "@/components/OrdersList.vue";
import FormPagePeo from "@/components/FormSendPeo.vue";
import OrdersDetails from "@/components/OrdersDetails.vue";


const routes = [
    {path : "/app/fff", component: HelloWorld},
    {path : "/app/message", component:  MessageForm},
    {path : "/app/orders/order/:id", name: "OrdersDetails" , component:  OrdersDetails, props: true},
    {path: "/app/orders/order/form/:id", name: "FormPagePeo", component: FormPagePeo},
    {path: "/app/orders", component: OrdersList}
];

const router = createRouter({
    history: createWebHistory(),
    routes
})
console.log('Registered routes:', router.getRoutes());

export default router;
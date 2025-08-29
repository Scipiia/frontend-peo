import { createRouter, createWebHistory } from "vue-router";
//import HelloWorld from "@/components/HelloWorld.vue";
import MessageForm from "@/components/MessageForm.vue";
import OrdersList from "@/components/OrdersList.vue";
import FormPagePeo from "@/components/FormSendPeo.vue";
import OrdersDetails from "@/components/OrdersDetails.vue";
import PrintNormOrder from "@/components/PrintNormOrder.vue";
import NormOrdersList from "@/components/NormOrdersList.vue";
import EditNormOrder from "@/components/EditNormOrder.vue";
//import GetNormOrder from "@/components/GetNormOrder.vue";
import AssignWorkers from "@/components/AssignWorkers.vue";


const routes = [
    //{path : "/api/fff", component: HelloWorld},
    {path : "/api/message", component:  MessageForm},
    {path : "/api/orders/order-norm/:id", name: "OrdersDetails" , component:  OrdersDetails, props: true},
    {path: "/api/orders/order-norm/form/:id", name: "FormPagePeo", component: FormPagePeo},
    {path: "/api/norm/order-norm/print/:id", name: "FormPrintNorm", component: PrintNormOrder},
    {path: "/api/orders", component: OrdersList},
    {path: "/api/norm/orders", name: "NormOrdersList", component: NormOrdersList},
    {path: "/api/norm/orders/order-norm/edit/:id", name: "EditNormOrder", component: EditNormOrder},
    //{path: "/api/norm/orders/norm-order/:id", name: "GetNormOrder", component: GetNormOrder},
    {path: "/api/norm/workers", name: "AssignWorkers", component: AssignWorkers}
];

const router = createRouter({
    history: createWebHistory(),
    routes
})
console.log('Registered routes:', router.getRoutes());

export default router;
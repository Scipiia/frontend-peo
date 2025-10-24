import { createRouter, createWebHistory } from "vue-router";
import OrdersList from "@/components/OrdersList.vue";
import FormPagePeo from "@/components/FormSendPeo.vue";
import OrdersDetails from "@/components/OrdersDetails.vue";
import PrintNormOrder from "@/components/PrintNormOrder.vue";
import NormOrdersList from "@/components/NormOrdersList.vue";
import EditNormOrder from "@/components/EditNormOrder.vue";
import AssignWorkers from "@/components/AssignWorkers.vue";
import FinalNormOrdersList from "@/components/FinalNormOrdersList.vue";


const routes = [
    {path : "/api/orders/order-norm/:id", name: "OrdersDetails" , component:  OrdersDetails, props: true},
    {path: "/api/orders/order-norm/form/:id", name: "FormPagePeo", component: FormPagePeo},
    {path: "/api/norm/order-norm/print/:id", name: "FormPrintNorm", component: PrintNormOrder},
    {path: "/api/orders", component: OrdersList},
    {path: "/api/norm/orders", name: "NormOrdersList", component: NormOrdersList},
    {path: "/api/norm/orders/order-norm/edit/:id", name: "EditNormOrder", component: EditNormOrder},
    {path: "/api/norm/workers/:id", name: "AssignWorkers", component: AssignWorkers},
    {path: "/api/final/orders", name: "FinalNormOrdersList", component: FinalNormOrdersList}
];

const router = createRouter({
    history: createWebHistory(),
    routes
})
console.log('Registered routes:', router.getRoutes());

export default router;
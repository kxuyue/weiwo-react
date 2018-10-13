import asyncComponent from '../components/AsyncComponent';
const SupplierHome = asyncComponent(() => import("../pages/home/SupplierHome"));
const Register = asyncComponent(() => import("../pages/register/Register"));
const BuyerHome = asyncComponent(() => import("../pages/home/BuyerHome"));
const Details = asyncComponent(() => import("../pages/details/Details"));
const History = asyncComponent(() => import("../pages/history/History"));
const Upload = asyncComponent(() => import("../pages/upload/Upload"));
const Login = asyncComponent(() => import("../pages/login/Login"));


export const routeWhiteList = [
    { path: '/login', name: "Login", component: Login },
    { path: '/register', name: "Register", component: Register }
];

export const buyerRouteList = [
    { path: '/', name: "Home", component: BuyerHome },
    { path: '/details', name: "Details", component: Details },
    { path: '/history', name: "History", component: History },
    { path: '/upload', name: "Upload", component: Upload },
]

export const supplierRouteList = [
    { path: '/', name: "Home", component: SupplierHome },
    { path: '/details', name: "Details", component: Details },
    { path: '/history', name: "History", component: History },
]
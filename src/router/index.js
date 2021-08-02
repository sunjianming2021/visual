import Vue from 'vue';
import VueRouter from 'vue-router';
// import SellerPage from 'pages/SellerPage';
// import TrendPage from 'pages/TrendPage';
// import MapPage from 'pages/MapPage';
// import RankPage from 'pages/RankPage';
// import HotPage from 'pages/HotPage';
// import StockPage from 'pages/StockPage';
import ScreenPage from 'pages/ScreenPage';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/screenPage' },
  { path: '/screenPage', name: 'ScreenPage', component: ScreenPage },
  // { path: '/sellerPage', name: 'SellerPage', component: SellerPage },
  // { path: '/trendPage', name: 'TrendPage', component: TrendPage },
  // { path: '/mapPage', name: 'MapPage', component: MapPage },
  // { path: '/rankPage', name: 'RankPage', component: RankPage },
  // { path: '/hotPage', name: 'HotPage', component: HotPage },
  // { path: '/stockPage', name: 'StockPage', component: StockPage },
];

const router = new VueRouter({
  routes,
  mode: 'history',
});

export default router;

<template>
  <div class='screen-container' :style="containerStyle">
    <header class="screen-header">
      <div>
        <img :src="header_src" alt="">
      </div>

      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <img @click="handleChangeTheme" :src="theme_src" class="qiehuan">
        <span class="datetime">2049-01-01 00:00:00</span>
      </div>
    </header>
    <div class="screen-body">
      <section class='screen-left'>
        <div class="left-top" :class="[fullScreenStatus.trend?'fullscreen':'']">
          <!-- 销量趋势图 -->
          <trend ref='trend' />
          <div class="resize">
            <!-- icon-compress-alt expand-->
            <span
              @click="changSize('trend')"
              :class="[
                'iconfont',
                fullScreenStatus.trend?
                'icon-compress-alt':
                'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div class="left-bottom" :class="[fullScreenStatus.seller?'fullscreen':'']">
          <!-- 商家销售金额图 -->
          <seller ref='seller' />
          <div class="resize">
            <!-- icon-compress-alt extend-->
            <span
              @click="changSize('seller')"
              :class="[
                'iconfont',
                fullScreenStatus.seller?
                'icon-compress-alt':
                'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div class="middle-top" :class="[fullScreenStatus.map?'fullscreen':'']">
          <!-- 商家分布图 -->
          <Map ref='map' />
          <div class="resize">
            <!-- icon-compress-alt extend-->
            <span
              @click="changSize('map')"
              :class="[
                'iconfont',
                fullScreenStatus.map?
                'icon-compress-alt':
                'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div class="middle-bottom" :class="[fullScreenStatus.rank?'fullscreen':'']">
          <!-- 地区销量排行图表 -->
          <rank ref='rank' />
          <div class="resize">
            <!-- icon-compress-alt extend-->
            <span
              @click="changSize('rank')"
              :class="[
                'iconfont',
                fullScreenStatus.rank?
                'icon-compress-alt':
                'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
      <section class='screen-right'>
        <div class="right-top" :class="[fullScreenStatus.hot?'fullscreen':'']">
           <!-- 热销商品占比图表 -->
           <hot ref='hot' />
           <div class="resize">
            <!-- icon-compress-alt extend-->
            <span
              @click="changSize('hot')"
              :class="[
                'iconfont',
                fullScreenStatus.hot?
                'icon-compress-alt':
                'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div class="right-bottom" :class="[fullScreenStatus.stock?'fullscreen':'']">
          <!-- 库存销量分析图表 -->
          <stock ref='stock' />
          <div class="resize">
            <!-- icon-compress-alt extend-->
            <span
              @click="changSize('stock')"
              :class="[
                'iconfont',
                fullScreenStatus.stock?
                'icon-compress-alt':
                'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
    </div>

  </div>
</template>

<script>
import Hot from 'tpl/Hot';
import Map from 'tpl/Map';
import Seller from 'tpl/Seller';
import Stock from 'tpl/Stock';
import Rank from 'tpl/Rank';
import Trend from 'tpl/Trend';
import { mapState } from 'vuex';
import { getThemeValue } from 'lib/theme_utils';

export default {
  components: {
    Hot,
    Map,
    Seller,
    Stock,
    Rank,
    Trend,
  },
  data() {
    return {
      // 定义图表的全屏状态
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false,
      },
    };
  },
  computed: {
    ...mapState({
      theme: (store) => store.theme.themeName,
    }),
    header_src() {
      return `/static/img/${getThemeValue(this.theme).headerBorderSrc}`;
    },
    theme_src() {
      return `/static/img/${getThemeValue(this.theme).themeSrc}`;
    },
    containerStyle() {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor,
      };
    },

  },
  created() {
    this.$socket.registerCallBack('fullScreen', this.recvData);
    this.$socket.registerCallBack('themeChange', this.recvThemeChange);
  },
  destroyed() {
    this.$socket.unRegisterCallBack('fullScreen');
    this.$socket.unRegisterCallBack('themeChange');
  },
  methods: {
    changSize(chartName) {
      // 改变fullScreenStatus 数据
      // 2.需要调用图表组件的screenAdapter方法
      // this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName];
      // this.$nextTick(() => {
      //   this.$refs[chartName].screenAdapter();
      // });
      const targetValue = !this.fullScreenStatus[chartName];
      this.$socket.send({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName,
        value: targetValue,
      });
    },
    recvData(data) {
      // 取出是哪个图片要切换,
      const { chartName, value } = data;
      this.fullScreenStatus[chartName] = value;
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapter();
      });
    },
    handleChangeTheme() {
      // 修改Vuex中的数据
      // this.$store.commit('changeTheme');

      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: '',
      });
    },
    recvThemeChange() {
      this.$store.commit('changeTheme');
    },
  },
};
</script>

<style lang="stylus" scoped>
.fullscreen
  position: fixed!important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;

.screen-container
  width 100%;
  height 100%;
  padding 0 20px;
  background-color #161522;
  color #fff
  box-sizing border-box;
  .screen-header
    width: 100%;
    height: 64px;
    font-size: 20px;
    position: relative;
    & > div
      img {
        width: 100%;
      }
    .title
      position: absolute;
      left: 50%;
      top: 50%;
      font-size: 20px;
      transform: translate(-50%, -50%);
      &-right
        display: flex;
        align-items: center;
        position:absolute;
        right: 0px;
        top: 50%;
        transform: translateY(-80%);
    .qiehuan
      width: 28px;
      height: 21px;
      cursor: pointer;
    .datetime
      font-size: 15px;
      margin-left: 10px;
  .screen-body
    width: 100%;
    height: 100%;
    display: flex;
    margin-top: 10px;
    .screen-left
      height: 100%;
      width: 27.6%;
      .left-top
        height: 53%;
        position: relative;

      .left-bottom
        height: 31%;
        margin-top: 25px;
        position: relative;
    .screen-middle
      height: 100%;
      width: 41.5%;
      margin-left: 1.6%;
      margin-right: 1.6%;
      .middle-top
        width: 100%;
        height: 56%;
        position: relative;

      .middle-bottom
        margin-top: 25px;
        width: 100%;
        height: 28%;
        position: relative;
    .screen-right
      height: 100%;
      width: 27.6%;
      .right-top
        height: 46%;
        position: relative;

      .right-bottom
        height: 38%;
        margin-top: 25px;
        position: relative;
.resize
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
</style>

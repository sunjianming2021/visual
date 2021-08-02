<template>
  <div class='com-container'>
    <div class="title" :style="comStyle">
      <span >{{showTitle}}</span>
      <span class='iconfont icon-arrow-down title-icon'
        :style="comStyle"
        @click="showChoice = !showChoice"
      ></span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div class="select-item"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handlSelect(item.key)"
        >{{item.text}}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
import echarts from 'lib/echarts';
import { mapState } from 'vuex';
import { getThemeValue } from 'lib/theme_utils';

export default {
  data() {
    return {
      chartInstance: null,
      allData: null, // 从服务器获取的数据
      showChoice: false, // 是否显示可选项
      choiceType: 'map',
      titleFontSize: 0,
    };
  },
  watch: {
    theme() {
      this.chartInstance.dispose(); // 销毁当前图表
      this.initChart(); // 重新以最新的主题名称初始化图表对象
      this.screenAdapter(); // 完成屏幕适配
      this.updateChart(); // 更新图片展示
    },
  },
  created() {
    // 注册回调函数
    this.$socket.registerCallBack('trendData', this.getData);
  },
  mounted() {
    this.initChart();

    // this.getData();
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: '',
    });
    window.addEventListener('resize', this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter);
    this.$socket.unRegisterCallBack('trendData');
  },
  computed: {
    ...mapState({
      theme: (store) => store.theme.themeName,
    }),
    selectTypes() {
      if (!this.allData) {
        return [];
      }
      return this.allData.type.filter((item) => item.key !== this.choiceType);
    },
    showTitle() {
      if (!this.allData) {
        return '';
      }

      return `🇨🇳  ${this.allData[this.choiceType].title}`;
    },
    comStyle() {
      return {
        fontSize: `${this.titleFontSize}px`,
        color: getThemeValue(this.theme).titleColor,
      };
    },
    marginStyle() {
      return {
        marginLeft: `${this.titleFontSize}px`,
        backgroundColor: getThemeValue(this.theme).downBackgroundColor,
      };
    },
  },
  methods: {
    initChart() {
      this.chartInstance = echarts.init(this.$refs.trend_ref, this.theme);
      this.initOption = {
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            lineStyle: {
              type: 'solid',
            },
          },
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle',
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
        },

      };
      this.chartInstance.setOption(this.initOption);
    },
    // async getData() {
    //   this.allData = await this.$http.get('/api/trend');
    //   this.updateChart();
    // },
    // socket
    getData(data) {
      this.allData = data;
      this.updateChart();
    },
    updateChart() {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11,168,44,0.5)',
        'rgba(44,110,255,0.5)',
        'rgba(22,242,217,0.5)',
        'rgba(254,33,30,0.5)',
        'rgba(250,105,0,0.5)',
      ];
      // 全透明颜色值
      const colorArr2 = [
        'rgba(11,168,44,0)',
        'rgba(44,110,255,0)',
        'rgba(22,242,217,0)',
        'rgba(254,33,30,0)',
        'rgba(250,105,0,0)',
      ];
      // 处理数据
      // 类目轴数据
      const timeArr = this.allData.common && this.allData.common.month;
      // y轴数据 series下的数据
      const valueArr = this.allData[this.choiceType] && this.allData[this.choiceType].data;
      const seriesArr = valueArr.map((item, index) => ({
        name: item.name,
        type: 'line',
        data: item.data,
        stack: this.choiceType,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: colorArr1[index],
            }, {
              offset: 1,
              color: colorArr2[index],
            }]),
        },
      }));
      // 图例数据
      const legendArr = valueArr.map((item) => item.name);
      const dataOption = {
        legend: {
          data: legendArr,
        },
        xAxis: {
          data: timeArr,
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    handlSelect(currentType) {
      this.choiceType = currentType;
      this.updateChart();
      this.showChoice = false;
    },
  },
};
</script>
<style lang="stylus" scoped>
  .title
    position absolute;
    left: 20px;
    top: 20px;
    z-index 1;
    color #fff;
    &-icon
      margin-left 10px;
      cursor pointer
  .select-con
    background-color #222733
</style>

<template>
  <div class='com-container'>
    <div class="com-chart" ref='hot_ref'></div>
    <span class='iconfont icon-arrow-lift arr-left' @click="toPrev" :style="comStyle"></span>
    <span class='iconfont icon-arrow-right arr-right' @click="toNext" :style="comStyle"></span>
    <span class='cat-name' :style="comStyle">{{catName}}</span>
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
      allData: null,
      currentIndex: 0, // 当前展示的一级分类数据
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
  computed: {
    ...mapState({
      theme: (store) => store.theme.themeName,
    }),
    catName() {
      if (!this.allData) return '';
      return this.allData[this.currentIndex].name;
    },
    comStyle() {
      return {
        fontSize: `${this.titleFontSize}px`,
        color: getThemeValue(this.theme).titleColor,
      };
    },

  },
  created() {
    this.$socket.registerCallBack('hotData', this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hot',
      value: '',
    });
    window.addEventListener('resize', this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter);
    this.$socket.unRegisterCallBack('hotData');
  },
  methods: {
    initChart() {
      this.chartInstance = echarts.init(this.$refs.hot_ref, this.theme);
      const initOption = {
        title: {
          text: '🇨🇳  热销商品的占比',
          left: 20,
          top: 20,
        },
        legend: {
          top: '15%',
          icon: 'circle',
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const { children: thirdCategory } = arg.data;
            // 计算出三级分类的总和
            let total = 0;
            thirdCategory.forEach((item) => {
              total += item.value;
            });
            let retStr = '';
            thirdCategory.forEach((item) => {
              retStr += `
              <div style='display:flex;justify-content:space-between;'>
                <span style='margin-right:20px;'>${item.name}</span><span>${`${((item.value / total) * 100).toFixed(2)}%`}</span>
              </div>
              `;
            });
            return retStr;
          },
        },
        series: [{
          type: 'pie',
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
            },
            labelLine: {
              show: false,
            },
          },
        }],
      };
      this.chartInstance.setOption(initOption);
    },
    // async getData() {
    //   // 获取数据
    //   this.allData = await this.$http.get('/api/hot');
    //   this.updateChart();
    // },
    getData(data) {
      this.allData = data;
      this.updateChart();
    },
    updateChart() {
      // 处理图表数据
      const legendData = this.allData[this.currentIndex].children.map((item) => item.name);
      const seriesData = this.allData[this.currentIndex].children.map((item) => ({
        name: item.name,
        value: item.value,
        children: item.children,
      }));
      const updateData = {
        legend: {
          data: legendData,
        },
        series: [{
          data: seriesData,
        }],
      };
      this.chartInstance.setOption(updateData);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6;
      const adapterData = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
        series: [{
          radius: this.titleFontSize * 4.5,
          center: ['50%', '60%'],
        }],
      };
      this.chartInstance.setOption(adapterData);
      this.chartInstance.resize();
    },

    toPrev() {
      this.currentIndex -= 1;
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1;
      }
      this.updateChart();
    },
    toNext() {
      this.currentIndex += 1;
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0;
      }
      this.updateChart();
    },
  },
};
</script>

<style lang="stylus" scoped>
.arr
  &-left,&-right
    position absolute
    bottom 50%;
    transform translateY(-50%);
    color #fff;
    cursor pointer
  &-left
    left: 10%;
  &-right
    right 10%;
.cat-name
  position absolute;
  left:70%;
  bottom 20px;
  color #fff;

</style>

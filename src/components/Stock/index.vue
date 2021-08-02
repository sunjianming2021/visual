<template>
  <div class='com-container'>
    <div class="com-chart" ref='stock_ref'></div>
  </div>
</template>

<script>
import echarts from 'lib/echarts';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0, // 当前显示的数据页数
      timerId: null,
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
  },
  created() {
    this.$socket.registerCallBack('stockData', this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: '',
    });
    window.addEventListener('resize', this.screenAdapter);
    this.screenAdapter();
    this.startInterval();
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter);
    clearInterval(this.timerId);
    this.$socket.unRegisterCallBack('stockData');
  },
  methods: {
    initChart() {
      this.chartInstance = echarts.init(this.$refs.stock_ref, this.theme);
      const initOption = {
        title: {
          text: '🇨🇳  库存和销量分析',
          left: 20,
          top: 20,
        },
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId);
      });
      this.chartInstance.on('mouseout', () => {
        this.startInterval();
      });
    },
    // async getData() {
    //   // 获取数据
    //   this.allData = await this.$http.get('/api/stock');
    //   this.updateChart();
    // },
    getData(data) {
      this.allData = data;
      this.updateChart();
    },
    updateChart() {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%'],
      ];
      const colorArr = [
        ['#4ff778', '#0ba82c'],
        ['#e5dd45', '#e8b11c'],
        ['#e8821c', '#e55445'],
        ['#5052ee', '#ab6ee5'],
        ['#23e5e5', '#3e72bf'],
      ];
      const start = this.currentIndex * 5;
      const end = (this.currentIndex + 1) * 5;
      const showData = this.allData.slice(start, end);
      const seriesArr = showData.map((item, index) => ({
        type: 'pie',
        center: centerArr[index],
        hoverAnimation: false, // 关闭鼠标移入动画
        labelLine: {
          show: false,
        },
        data: [{
          value: item.sales,
          name: `${item.name}\n\n${item.stock}`,
          label: {
            position: 'center',
            color: colorArr[index][0],

          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: colorArr[index][0],
              },
              {
                offset: 1,
                color: colorArr[index][1],
              },
            ]),
          },
        }, {
          value: item.stock,
          itemStyle: {
            color: '#333843',
          },
        }],
      }));
      const updateData = {
        series: seriesArr,
      };
      this.chartInstance.setOption(updateData);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6;
      const innerRadius = titleFontSize * 2.8;
      const outterRadius = innerRadius * 1.125;

      const seriesArr = [];
      for (let i = 0; i < 5; i += 1) {
        seriesArr.push({
          type: 'pie',
          radius: [outterRadius, innerRadius],
          label: {
            fontSize: titleFontSize / 1.5,
          },
        });
      }
      const adapterData = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: seriesArr,
      };

      this.chartInstance.setOption(adapterData);
      this.chartInstance.resize();
    },
    startInterval() {
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        this.currentIndex += 1;
        if (this.currentIndex > 1) {
          this.currentIndex = 0;
        }
        this.updateChart();
      }, 5000);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>

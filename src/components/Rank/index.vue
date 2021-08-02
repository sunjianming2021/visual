<template>
  <div class='com-container'>
    <div class="com-chart" ref='rank_ref'></div>
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
      startValue: 0, // 区域缩放的起点
      endValue: 9, // 区域缩放的终点
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
    this.$socket.registerCallBack('rankData', this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: '',
    });
    window.addEventListener('resize', this.screenAdapter);
    this.screenAdapter();
    this.startInterval();
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter);
    clearInterval(this.timerId);
    this.$socket.unRegisterCallBack('rankData');
  },
  methods: {
    initChart() {
      this.chartInstance = echarts.init(this.$refs.rank_ref, this.theme);
      const initOption = {
        title: {
          text: '🇨🇳  地区销售排行',
          left: 20,
          top: 20,
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true,
        },
        tooltip: {
          show: true,
        },
        xAxis: {
          type: 'category',
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          type: 'bar',
        }],
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
    //   this.allData = await this.$http.get('/api/rank');
    //   // 排序  desc
    //   this.allData.sort((a, b) => b.value - a.value);
    //   this.updateChart();
    // },
    getData(data) {
      this.allData = data;
      // 排序  desc
      this.allData.sort((a, b) => b.value - a.value);
      this.updateChart();
    },
    updateChart() {
      // 处理图标需要的数据
      // 颜色渐变
      const colorAll = [
        ['#0ba82c', '#4ff778'],
        ['#2e72bf', '#23e5e5'],
        ['#5052ee', '#ab6ee5'],
      ];
      // 所有省份所形成的数据
      const provinceArr = this.allData.map((item) => item.name);
      // 所有省份对应的销售金额
      const valueArr = this.allData.map((item) => item.value);
      const updateData = {
        xAxis: {
          data: provinceArr,
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue,
        },
        series: [{
          data: valueArr,
          itemStyle: {
            color: (arg) => {
              let targetColorArr = null;
              if (arg.value > 300) {
                targetColorArr = colorAll[0];
              } else if (arg.value > 200) {
                targetColorArr = colorAll[1];
              } else {
                targetColorArr = colorAll[2];
              }
              return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: targetColorArr[0],
                },
                {
                  offset: 1,
                  color: targetColorArr[1],
                },
              ]);
            },

          },
        }],
      };
      this.chartInstance.setOption(updateData);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6;
      console.log(titleFontSize);
      const adapterData = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [{
          barWidth: titleFontSize,
          itemStyle: {
            borderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0],
          },
        }],
      };

      this.chartInstance.setOption(adapterData);
      this.chartInstance.resize();
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      this.timerId = setInterval(() => {
        this.startValue += 1;
        this.endValue += 1;
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0;
          this.endValue = 9;
        }
        this.updateChart();
      }, 2000);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>

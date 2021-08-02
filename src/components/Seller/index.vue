<template>
  <div class='com-container'>
    <div class="com-chart" ref='seller_ref'></div>
  </div>
</template>

<script>
import echarts from 'lib/echarts';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      chartInstance: null,
      allData: [], // 服务器返回数据
      currentPage: 1, // 当前显示的页数
      totalPage: 0, // 一共多少页
      timerId: null, // 定时器
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
    this.$socket.registerCallBack('sellerData', this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: '',
    });
    window.addEventListener('resize', this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    clearInterval(this.timerId);
    window.removeEventListener('resize', this.screenAdapter);
    this.$socket.unRegisterCallBack('sellerData');
  },
  methods: {
    // 初始化echartInstance 对象
    initChart() {
      this.chartInstance = echarts.init(this.$refs.seller_ref, this.theme);
      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '🇨🇳 商家销售统计',
          left: 20,
          top: 20,
        },
        grid: {
          top: '20%',
          left: '3%',
          bottom: '6%',
          right: '3%',
          containLabel: true, // 包含坐标轴
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',

        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2d3443',
              type: 'solid',
            },
          },
        },
        series: [{
          type: 'bar',
          label: {
            show: true,
            position: 'right',
            color: '#fff',
          },
          itemStyle: {
            // 指明颜色渐变的方向
            // 指明不同百分比之下的值
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: '#5052ee',
              },
              {
                offset: 1,
                color: '#ab6ee5',
              },
            ]),
          },
        }],
      };
      this.chartInstance.setOption(initOption);
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mousemove', () => {
        clearInterval(this.timerId);
      });
      this.chartInstance.on('mouseout', () => {
        this.startInterval();
      });
    },
    // 获取数据
    // async getData() {
    //   this.allData = await this.$http.get('/api/seller');
    //   this.allData.sort((a, b) => a.value - b.value);
    //   // 每5个元素显示一页
    //   this.totalPage = this.allData.length % 5 === 0
    //     ? this.allData.length / 5
    //     : this.allData.length / 5 + 1;
    //   this.upldateChart();
    //   this.startInterval();
    // },
    getData(data) {
      this.allData = data;
      this.allData.sort((a, b) => a.value - b.value);
      // 每5个元素显示一页
      this.totalPage = this.allData.length % 5 === 0
        ? this.allData.length / 5
        : this.allData.length / 5 + 1;
      this.upldateChart();
      this.startInterval();
    },
    // 更新图表
    upldateChart() {
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      const showData = this.allData.slice(start, end);
      const sellerNames = showData.map((item) => item.name);
      const sellerValues = showData.map((item) => item.value);
      const updateData = {
        yAxis: {
          data: sellerNames,
        },
        series: [{
          data: sellerValues,
        }],
      };
      this.chartInstance.setOption(updateData);
    },
    // 当浏览器的大小发生变化,适配屏幕
    screenAdapter() {
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: [{
          barWidth: titleFontSize,
          itemStyle: {
            borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
          },
        }],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      this.timerId = setInterval(() => {
        this.currentPage += 1;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        this.upldateChart();
      }, 3000);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>

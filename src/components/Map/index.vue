<template>
  <div class='com-container' @dblclick="revertMap">
    <div class="com-chart" ref='map_ref'></div>
  </div>
</template>

<script>
import echarts from 'lib/echarts';
import { getProvinceMapInfo } from 'lib/map_utils';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      cacheMap: {}, // 所获取地图的缓存
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
    this.$socket.registerCallBack('mapData', this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: '',
    });
    window.addEventListener('resize', this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter);
    this.$socket.unRegisterCallBack('mapData');
  },
  methods: {
    async initChart() {
      this.chartInstance = echarts.init(this.$refs.map_ref, this.theme);
      // 获取中国地图数据
      const ret = await this.$http.get('/static/map/china.json');
      echarts.registerMap('china', ret);
      const initOption = {
        title: {
          text: '🇨🇳 商家分布',
          left: 20,
          top: 20,
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical',
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2e72bf',
            borderColor: '#333',
          },
        },
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on('click', async (arg) => {
        console.log(arg);
        const provinceInfo = getProvinceMapInfo(arg.name);
        if (!provinceInfo.key) return;
        // 获取数据
        // 判断地图数据是否缓存
        if (!this.cacheMap[provinceInfo.key]) {
          const city = await this.$http.get(provinceInfo.path);
          this.cacheMap[provinceInfo.key] = city;
          echarts.registerMap(provinceInfo.key, city);
        }

        const changeOption = {
          geo: {
            map: provinceInfo.key,
          },
        };
        this.chartInstance.setOption(changeOption);
      });
    },
    // async getData() {
    //   // 获取服务器数据
    //   this.allData = await this.$http.get('/api/map');
    //   this.updateChart();
    // },
    getData(data) {
      this.allData = data;
      this.updateChart();
    },
    updateChart() {
      // 处理图表需要的数据
      // 图例数据
      const legendArr = this.allData.map((item) => item.name);
      // 地图显示散点数据,增加一个配置  coordinateSystem:'geo'
      const seriesArr = this.allData.map((item) => ({
        type: 'effectScatter',
        rippleEffect: {
          scale: 5,
          brushType: 'stroke',
        },
        name: item.name,
        data: item.children,
        coordinateSystem: 'geo',
      }));
      const updateData = {
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(updateData);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
      const adapterData = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adapterData);
      this.chartInstance.resize();
    },
    // 回到中国地图
    revertMap() {
      const revertOption = {
        geo: {
          map: 'china',
        },
      };
      this.chartInstance.setOption(revertOption);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>

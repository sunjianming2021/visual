import * as echarts from 'echarts/core';
import {
  BarChart, LineChart, MapChart, PieChart,
} from 'echarts/charts';
import {
  TitleComponent, GridComponent, TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import 'echarts/theme/dark';

echarts.use([
  BarChart,
  LineChart,
  MapChart,
  PieChart,
  TitleComponent,
  GridComponent,
  TooltipComponent,
  SVGRenderer,
]);

export default echarts;

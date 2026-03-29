<template>
  <div class="radar-chart" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  scores: {
    type: Object,
    required: true
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  }
});

const chartRef = ref(null);
let chartInstance = null;

const constitutionLabels = [
  '阳虚质', '阴虚质', '气虚质', '痰湿质', 
  '湿热质', '血瘀质', '气郁质', '特禀质', '平和质'
];

const constitutionColors = [
  '#E89B7C', '#8BC4E8', '#E8C87C', '#A8C97C',
  '#E87C7C', '#B87CE8', '#7CB8E8', '#E87CB8', '#7CE89C'
];

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const scores = constitutionLabels.map(label => props.scores[label] || 0);
  const maxScore = Math.max(...scores, 10);

  const option = {
    radar: {
      indicator: constitutionLabels.map((label, index) => ({
        name: label,
        max: maxScore,
        color: constitutionColors[index]
      })),
      center: ['50%', '55%'],
      radius: '65%',
      splitNumber: 4,
      axisName: {
        color: '#666',
        fontSize: 12,
        fontWeight: 500
      },
      splitArea: {
        areaStyle: {
          color: ['#FAF8F5', '#F5F1EB', '#FAF8F5', '#F5F1EB']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#E8E2D9'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#E8E2D9'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: scores,
        name: '体质得分',
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(74, 124, 89, 0.1)' },
            { offset: 1, color: 'rgba(74, 124, 89, 0.4)' }
          ])
        },
        lineStyle: {
          color: '#4A7C59',
          width: 2
        },
        itemStyle: {
          color: '#4A7C59',
          borderColor: '#4A7C59',
          borderWidth: 2
        },
        symbol: 'circle',
        symbolSize: 6
      }]
    }],
    legend: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const values = params.value;
        let result = '<div style="padding: 8px;">';
        constitutionLabels.forEach((label, index) => {
          result += `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>${label}：</span>
            <span style="font-weight: bold; margin-left: 12px;">${values[index]}分</span>
          </div>`;
        });
        result += '</div>';
        return result;
      }
    }
  };

  chartInstance.setOption(option);
};

const resizeChart = () => {
  chartInstance?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
});

watch(() => props.scores, () => {
  if (chartInstance) {
    const scores = constitutionLabels.map(label => props.scores[label] || 0);
    chartInstance.setOption({
      series: [{
        data: [{
          value: scores
        }]
      }]
    });
  }
}, { deep: true });
</script>

<style scoped>
.radar-chart {
  width: v-bind(width);
  height: v-bind(height);
}
</style>

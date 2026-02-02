<template>
  <div class="stat-container">
    <div class="container">
      <div class="header">
        <div class="title">数据统计</div>
        <div class="filter">
           <el-radio-group v-model="dateType" @change="handleDateTypeChange" style="margin-right: 20px">
              <el-radio-button label="1">今日</el-radio-button>
              <el-radio-button label="7">近7天</el-radio-button>
              <el-radio-button label="30">近30天</el-radio-button>
           </el-radio-group>
           
           <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :disabled-date="disabledDate"
            @change="handleDateRangeChange"
          />
          
          <el-button type="success" @click="handleExport" style="margin-left: 20px">导出报表</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="stat-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="销售额统计" name="turnover">
            <div ref="turnoverChartRef" class="chart-box"></div>
        </el-tab-pane>
        <el-tab-pane label="发货单统计" name="order">
            <div ref="orderChartRef" class="chart-box"></div>
        </el-tab-pane>
        <el-tab-pane label="客户增长" name="user">
            <div ref="userChartRef" class="chart-box"></div>
        </el-tab-pane>
        <el-tab-pane label="热销商品 Top10" name="top10">
            <div ref="top10ChartRef" class="chart-box"></div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getTurnoverStatistics, getOrderStatistics, getUserStatistics, getTop10, exportReport } from '@/api/statistics'
import { ElMessage } from 'element-plus'

// 日期相关
const dateType = ref('1')
const dateRange = ref<any>([])
const activeTab = ref('turnover')

// 图表 DOM 引用
const turnoverChartRef = ref()
const orderChartRef = ref()
const userChartRef = ref()
const top10ChartRef = ref()

let myChart: echarts.ECharts | null = null

// 初始化日期
const initDate = () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 1) // 今日默认含昨日对比
    dateRange.value = [start, end]
}

const disabledDate = (time: Date) => {
    return time.getTime() > Date.now()
}

const handleDateTypeChange = (val: string) => {
    const end = new Date()
    const start = new Date()
    const days = val === '1' ? 1 : parseInt(val) - 1
    start.setTime(start.getTime() - 3600 * 1000 * 24 * days)
    dateRange.value = [start, end]
    fetchData()
}

const handleDateRangeChange = () => {
    dateType.value = '' // 清空快捷选型
    fetchData()
}

const getParams = () => {
    if (!dateRange.value || dateRange.value.length < 2) return null
    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    return {
        begin: formatDateLocal(dateRange.value[0]),
        end: formatDateLocal(dateRange.value[1])
    }
}

// 核心加载逻辑
const fetchData = async () => {
    const params = getParams()
    if (!params) return
    
    // 根据当前 Tab 加载不同数据
    if (activeTab.value === 'turnover') {
        loadTurnover(params)
    } else if (activeTab.value === 'order') {
        loadOrder(params)
    } else if (activeTab.value === 'user') {
        loadUser(params)
    } else if (activeTab.value === 'top10') {
        loadTop10(params)
    }
}

const initChart = (dom: HTMLElement) => {
    if (myChart) {
        myChart.dispose()
    }
    myChart = echarts.init(dom)
    return myChart
}

const loadTurnover = async (params: any) => {
    try {
        const res: any = await getTurnoverStatistics(params)
        if (res) {
            await nextTick()
            const chart = initChart(turnoverChartRef.value)
            const dateList = res.dateList ? res.dateList.split(',') : []
            const turnoverList = res.turnoverList ? res.turnoverList.split(',') : []
            
            chart.setOption({
                title: { text: '销售额趋势图' },
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: dateList },
                yAxis: { type: 'value' },
                series: [{ data: turnoverList, type: 'line', smooth: true, itemStyle: { color: '#ff7675' } }]
            })
        }
    } catch (e) {}
}

const loadOrder = async (params: any) => {
    try {
        const res: any = await getOrderStatistics(params)
        if (res) {
             await nextTick()
            const chart = initChart(orderChartRef.value)
            const dateList = res.dateList ? res.dateList.split(',') : []
            const orderCountList = res.orderCountList ? res.orderCountList.split(',') : []
            const validOrderCountList = res.validOrderCountList ? res.validOrderCountList.split(',') : []
            
            chart.setOption({
                title: { text: '发货单量统计' },
                tooltip: { trigger: 'axis' },
                legend: { data: ['总单量', '有效单量'] },
                xAxis: { type: 'category', data: dateList },
                yAxis: { type: 'value' },
                series: [
                    { name: '总单量', data: orderCountList, type: 'line', smooth: true },
                    { name: '有效单量', data: validOrderCountList, type: 'line', smooth: true }
                ]
            })
        }
    } catch (e) {}
}

const loadUser = async (params: any) => {
    try {
        const res: any = await getUserStatistics(params)
        if (res) {
             await nextTick()
            const chart = initChart(userChartRef.value)
            const dateList = res.dateList ? res.dateList.split(',') : []
            const newUserList = res.newUserList ? res.newUserList.split(',') : []
            const totalUserList = res.totalUserList ? res.totalUserList.split(',') : []
            
            chart.setOption({
                title: { text: '客户增长统计' },
                tooltip: { trigger: 'axis' },
                legend: { data: ['新增客户', '总客户数'] },
                xAxis: { type: 'category', data: dateList },
                yAxis: { type: 'value' },
                series: [
                    { name: '新增客户', data: newUserList, type: 'bar' },
                    { name: '总客户数', data: totalUserList, type: 'line', yAxisIndex: 0 } // 双轴以后再加
                ]
            })
        }
    } catch (e) {}
}

const loadTop10 = async (params: any) => {
    try {
        const res: any = await getTop10(params)
        if (res) {
             await nextTick()
            const chart = initChart(top10ChartRef.value)
            const nameList = res.nameList ? res.nameList.split(',') : []
            const numberList = res.numberList ? res.numberList.split(',') : []
            
            chart.setOption({
                title: { text: '热销商品 Top10' },
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                xAxis: { type: 'category', data: nameList, axisLabel: { interval: 0, rotate: 30 } },
                yAxis: { type: 'value' },
                series: [{ data: numberList, type: 'bar', barWidth: '40%', itemStyle: { color: '#0984e3' } }]
            })
        }
    } catch (e) {}
}

const handleTabClick = () => {
    // 切换 Tab 时重新加载图表
    // 这里做个小延迟确保 DOM 渲染
    setTimeout(() => {
        fetchData()
    }, 100)
}

const handleExport = async () => {
    try {
        const res: any = await exportReport()
        // 确保返回的是 Blob
        if (res) {
            const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `运营报表_${new Date().getTime()}.xlsx`
            link.click()
            window.URL.revokeObjectURL(link.href)
            ElMessage.success('导出成功')
        }
    } catch (e) {
        console.error(e)
        ElMessage.error('导出失败')
    }
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
    myChart?.resize()
})

onMounted(() => {
    initDate()
    fetchData()
})
</script>

<style scoped>
.stat-container {
    padding: 20px;
}
.container {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    min-height: 600px;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}
.title {
    font-size: 20px;
    font-weight: bold;
}
.filter {
    display: flex;
    align-items: center;
}
.chart-box {
    width: 100%;
    height: 500px;
}
</style>

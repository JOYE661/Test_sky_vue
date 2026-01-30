<template>
  <div class="bg-gray-50 min-h-screen pb-20">
    <!-- Hero -->
    <section class="bg-blue-600 text-white py-20 lg:py-32">
      <div class="container mx-auto px-4 text-center">
        <p class="text-blue-100 text-sm font-semibold mb-3">解决方案 · 多级分销</p>
        <h5 class="text-4xl lg:text-6xl font-bold mb-6">Somago International</h5>
        <h1 class="text-4xl lg:text-6xl font-bold mb-6">多级分销计划</h1>
        <p class="text-lg lg:text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
          面向经销商、分销商与企业采购伙伴的佣金制增长方案。分享专属链接，
          建立团队网络，持续获得直推与多级推荐收益。
        </p>
        <div class="flex justify-center space-x-4">
          <button class="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">立即开通</button>
          <button class="border border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 transition">预约演示</button>
        </div>
      </div>
    </section>

    <!-- KPI Cards -->
    <!-- <section class="py-16 bg-white">
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div class="p-6">
          <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">💼</div>
          <h3 class="text-xl font-bold mb-2">累计推广成交</h3>
          <p class="text-gray-500">¥ 1,284,320（本月 +12.6%）</p>
        </div>
        <div class="p-6">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">🌐</div>
          <h3 class="text-xl font-bold mb-2">分销商数量</h3>
          <p class="text-gray-500">3,482（新增 152）</p>
        </div>
        <div class="p-6">
          <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">💰</div>
          <h3 class="text-xl font-bold mb-2">待结算佣金</h3>
          <p class="text-gray-500">¥ 86,540（本周到期）</p>
        </div>
      </div>
    </section> -->

    <!-- Referral Link -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold text-gray-800">推广工具</h2>
          <span class="text-primary hover:underline cursor-pointer">生成素材包 ></span>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-gray-900 mb-2">你的专属推广链接</h2>
          <p class="text-sm text-gray-500">分享给下级分销商，追踪每一笔成交。</p>
        </div>
        <div class="flex-1 lg:max-w-xl flex items-center gap-2">
          <input v-model="shareLink" readonly class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">复制</button>
          <button class="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm">生成二维码</button>
        </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold text-gray-800">快速开始</h2>
          <span class="text-primary hover:underline cursor-pointer">查看流程 ></span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="p-6">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">①</div>
            <h3 class="text-xl font-bold mb-2">开通分销身份</h3>
            <p class="text-gray-500">提交企业/个人信息，完成资质审核。</p>
          </div>
          <div class="p-6">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">②</div>
            <h3 class="text-xl font-bold mb-2">分享链接与码</h3>
            <p class="text-gray-500">线上线下推广，链接与订单自动归因。</p>
          </div>
          <div class="p-6">
            <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">③</div>
            <h3 class="text-xl font-bold mb-2">获得佣金结算</h3>
            <p class="text-gray-500">订单完成后按规则自动结算与对账。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Commission Tiers -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold text-gray-800">多级佣金结构</h2>
          <span class="text-primary hover:underline cursor-pointer">自定义比例 ></span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="tier in tiers" :key="tier.level" class="bg-white rounded-xl shadow-sm p-6 border">
            <div class="text-sm text-gray-500 mb-2">第 {{ tier.level }} 级</div>
            <div class="text-2xl font-bold text-gray-900 mb-2">{{ tier.rate }}%</div>
            <div class="text-xs text-gray-500">订单完成后 T+{{ tier.settleDays }} 天结算</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Referral Tree -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold text-gray-800">分销关系树（模拟）</h2>
          <span class="text-primary hover:underline cursor-pointer">查看全网 ></span>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="space-y-3">
            <div v-for="node in tree" :key="node.id" class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {{ node.name.slice(0,1) }}
                </div>
                <div>
                  <div class="font-semibold text-gray-900">{{ node.name }}</div>
                  <div class="text-xs text-gray-500">直属下级：{{ node.children }} 人</div>
                </div>
              </div>
              <div class="text-sm text-gray-600">本月贡献 ¥ {{ node.revenue }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Payout Table -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold text-gray-800">佣金结算记录（模拟）</h2>
          <button class="text-sm text-primary">导出</button>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
          <table class="min-w-full text-sm text-gray-600">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2">结算单号</th>
                <th class="py-2">分销商</th>
                <th class="py-2">层级</th>
                <th class="py-2">订单金额</th>
                <th class="py-2">佣金</th>
                <th class="py-2">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in payouts" :key="row.id" class="border-b last:border-0">
                <td class="py-3">{{ row.id }}</td>
                <td class="py-3">{{ row.user }}</td>
                <td class="py-3">L{{ row.level }}</td>
                <td class="py-3">¥ {{ row.amount }}</td>
                <td class="py-3 text-green-600 font-semibold">¥ {{ row.commission }}</td>
                <td class="py-3">
                  <span class="px-2 py-1 rounded-full text-xs" :class="row.status === '已结算' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-700'">
                    {{ row.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold text-gray-800">常见问题</h2>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4 text-sm text-gray-600">
          <div>
            <div class="font-semibold text-gray-900 mb-1">1. 如何获得佣金？</div>
            <div class="space-y-2">
              <p><span class="font-semibold">直推销售佣金</span> —— 通过你的专属链接带来的订单，均计入你的佣金收益，无论是客户、经销商或分销商的购买。</p>
              <p><span class="font-semibold">团队/下级分销佣金</span> —— 你邀请的分销商继续发展下级并产生订单时，你将按多级结构获得比例佣金。</p>
              <p><span class="font-semibold">使用推广码的大宗订单</span> —— 通过你的推广码产生的大额订单会被准确归因并计入佣金。</p>
            </div>
          </div>
          <div>
            <div class="font-semibold text-gray-900 mb-1">2. 销售如何追踪？</div>
            <p>所有订单通过你的专属链接或推广码自动追踪，确保直推和团队订单都能准确归因。</p>
          </div>
          <div>
            <div class="font-semibold text-gray-900 mb-1">3. 可否线上线下推广？</div>
            <p>可以。可通过社媒、网站、社群与线下渠道推广，只需遵守平台推广规范。</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const shareLink = ref('https://somago.com/r/AF12345')

const tiers = [
  { level: 1, rate: 12, settleDays: 7 },
  { level: 2, rate: 6, settleDays: 10 },
  { level: 3, rate: 3, settleDays: 15 }
]

const tree = [
  { id: 'u1', name: '华东区代理-王总', children: 36, revenue: '128,000' },
  { id: 'u2', name: '渠道分销-李经理', children: 18, revenue: '76,500' },
  { id: 'u3', name: '社区团长-张姐', children: 9, revenue: '34,200' }
]

const payouts = [
  { id: 'ST20240112', user: '王总', level: 1, amount: '45,200', commission: '5,424', status: '已结算' },
  { id: 'ST20240115', user: '李经理', level: 2, amount: '21,900', commission: '1,314', status: '待结算' },
  { id: 'ST20240118', user: '张姐', level: 3, amount: '8,600', commission: '258', status: '待结算' }
]
</script>

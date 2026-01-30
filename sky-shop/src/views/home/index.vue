<template>
  <div>
    <!-- Hero Banner -->
    <section class="bg-blue-600 text-white py-20 lg:py-32">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl lg:text-6xl font-bold mb-6">全渠道供应链解决方案</h1>
        <p class="text-lg lg:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          为餐饮、零售企业提供一站式订货、仓储、物流服务。品质保证，极速送达。
        </p>
        <div class="flex justify-center space-x-4">
          <router-link to="/products" class="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
            立即订货
          </router-link>
          <button class="border border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 transition">
            了解更多
          </button>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div class="p-6">
          <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">🚀</div>
          <h3 class="text-xl font-bold mb-2">极速配送</h3>
          <p class="text-gray-500">自有物流团队，同城最快 2 小时送达，全程冷链监控。</p>
        </div>
        <div class="p-6">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">🛡️</div>
          <h3 class="text-xl font-bold mb-2">品质严选</h3>
          <p class="text-gray-500">源头直采，严格质检，每一份食材都让您放心。</p>
        </div>
        <div class="p-6">
          <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">💰</div>
          <h3 class="text-xl font-bold mb-2">批发低价</h3>
          <p class="text-gray-500">去除中间环节，为您提供最具竞争力的B端批发价格。</p>
        </div>
      </div>
    </section>

    <!-- Recommended Products -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold text-gray-800">热门推荐</h2>
          <router-link to="/products" class="text-primary hover:underline">查看全部 ></router-link>
        </div>
        
        <!-- Grid System: Mobile 2 cols, Tablet 3 cols, Desktop 4 cols -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
          <div v-for="i in 8" :key="i" class="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group cursor-pointer">
            <div class="aspect-square bg-gray-200 relative overflow-hidden">
               <!-- Placeholder Image -->
               <img :src="`https://placehold.co/400x400?text=Product+${i}`" class="object-cover w-full h-full group-hover:scale-105 transition duration-500" alt="Product">
               <div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-20%</div>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-gray-800 mb-1 truncate">澳洲进口安格斯牛排 M3+</h3>
              <p class="text-sm text-gray-500 mb-3">500g/包 | 冷冻</p>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-red-600">¥ 128.00</span>
                <button class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

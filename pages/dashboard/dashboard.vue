<template>
  <view class="container">
    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ totalDevices }}</text>
        <text class="stat-label">设备总数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ onlineDevices }}</text>
        <text class="stat-label">在线设备</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ offlineDevices }}</text>
        <text class="stat-label">离线设备</text>
      </view>
    </view>

    <!-- 在线率卡片 -->
    <view class="rate-card">
      <text class="rate-title">📊 设备在线率</text>
      <text class="rate-value">{{ onlineRate }}%</text>
      <view class="rate-bar">
        <view class="rate-fill" :style="{ width: onlineRate + '%' }"></view>
      </view>
    </view>

    <!-- Ajax 请求演示卡片 -->
    <view class="api-card">
      <text class="api-title">🌐 Ajax 请求演示</text>
      <text class="api-desc">点击下方按钮，体验异步数据请求（一言API）</text>
      <button class="api-btn" @click="fetchQuote">
        获取一句名言
      </button>
      <view v-if="quoteText" class="quote-box">
        <text class="quote-content">「{{ quoteText }}」</text>
        <text v-if="quoteFrom" class="quote-from">—— {{ quoteFrom }}</text>
      </view>
      <view v-if="!quoteText" class="hint-text">
        <text>👆 点击上方按钮，获取一句名言</text>
      </view>
    </view>

    <!-- 设备列表区域：可展开/收起 -->
    <view class="device-section">
      <view class="section-header" @click="toggleDeviceList">
        <text class="section-title">📱 设备列表</text>
        <text class="toggle-btn">{{ showAllDevices ? '收起 ▲' : '展开 ▼' }}</text>
      </view>
      
      <!-- 预览模式：只显示前3台 -->
      <view v-if="!showAllDevices" class="preview-list">
        <view v-for="device in deviceList.slice(0, 3)" :key="device.id" class="device-item">
          <view class="device-info">
            <text class="device-name">{{ device.name }}</text>
            <text class="device-type">{{ device.type }}</text>
          </view>
          <text :class="device.status === 'online' ? 'online-text' : 'offline-text'">
            {{ device.status === 'online' ? '在线' : '离线' }}
          </text>
        </view>
        <!-- 点击提示文字也可以展开 -->
        <view v-if="deviceList.length > 3" class="preview-more" @click="toggleDeviceList">
          <text>等{{ deviceList.length }}台设备，点击展开查看全部</text>
        </view>
      </view>
      
      <!-- 展开模式：显示全部设备，支持滚动 -->
      <scroll-view v-else class="full-list" scroll-y :style="{ maxHeight: '500rpx' }">
        <view v-for="device in deviceList" :key="device.id" class="device-item">
          <view class="device-info">
            <text class="device-name">{{ device.name }}</text>
            <text class="device-type">{{ device.type }}</text>
            <text class="device-location">{{ device.location }}</text>
          </view>
          <text :class="device.status === 'online' ? 'online-text' : 'offline-text'">
            {{ device.status === 'online' ? '在线' : '离线' }}
          </text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部留白 -->
    <view class="bottom-space"></view>
  </view>
</template>

<script>
import { getDeviceList } from '@/utils/storage.js';

export default {
  data() {
    return {
      deviceList: [],
      totalDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      onlineRate: 0,
      quoteText: '',
      quoteFrom: '',
      showAllDevices: false
    };
  },
  async onShow() {
    await this.loadData();
  },
  methods: {
    // 加载设备数据
    async loadData() {
      const list = await getDeviceList();
      this.deviceList = list;
      this.totalDevices = list.length;
      this.onlineDevices = list.filter(d => d.status === 'online').length;
      this.offlineDevices = this.totalDevices - this.onlineDevices;
      this.onlineRate = this.totalDevices > 0 ? Math.round((this.onlineDevices / this.totalDevices) * 100) : 0;
    },
    
    // 切换设备列表展开/收起
    toggleDeviceList() {
      this.showAllDevices = !this.showAllDevices;
    },
    
    // 获取名言（点击按钮触发）
    fetchQuote() {
      // 显示加载提示
      uni.showLoading({ title: '加载中...', mask: true });
      
      // 发送 Ajax 请求
      uni.request({
        url: 'https://v1.hitokoto.cn/',
        method: 'GET',
        timeout: 8000,
        success: (res) => {
          console.log('一言API返回数据:', res.data);
          
          // 判断请求是否成功
          if (res.statusCode === 200 && res.data && res.data.hitokoto) {
            // 成功：显示获取到的名言
            this.quoteText = res.data.hitokoto;
            this.quoteFrom = res.data.from || '';
            
            // 如果有作者信息，也显示出来
            if (res.data.from_who) {
              this.quoteFrom = `${res.data.from_who} · ${this.quoteFrom}`;
            }
            
            uni.showToast({ title: '获取成功', icon: 'success' });
          } else {
            // 接口返回异常：使用备用名言
            this.setFallbackQuote();
            uni.showToast({ title: '已加载本地名言', icon: 'none' });
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          // 网络请求失败：使用备用名言
          this.setFallbackQuote();
          uni.showToast({ title: '网络异常，已加载本地名言', icon: 'none' });
        },
        complete: () => {
          // 无论成功或失败，都关闭加载提示
          uni.hideLoading();
        }
      });
    },
    
    // 备用本地名言（接口失败时使用）
    setFallbackQuote() {
      const fallbackQuotes = [
        { text: '代码是一种艺术，每次提交都是作品。', from: '程序员箴言' },
        { text: '优秀的代码是它自己最好的文档。', from: '编程思想' },
        { text: '简单是可靠的先决条件。', from: 'Edsger Dijkstra' },
        { text: '任何傻瓜都能写出计算机能理解的代码，优秀的程序员写出人能理解的代码。', from: 'Martin Fowler' },
        { text: '不要重复自己（DRY原则）。', from: '敏捷开发' },
        { text: '保持简单，保持愚蠢（KISS原则）。', from: '设计哲学' },
        { text: '过早优化是万恶之源。', from: 'Donald Knuth' }
      ];
      const random = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      this.quoteText = random.text;
      this.quoteFrom = random.from;
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20rpx;
  background: #F5F5F5;
  min-height: 100vh;
}

/* 统计卡片样式 */
.stats-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}
.stat-item {
  text-align: center;
}
.stat-value {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #007AFF;
}
.stat-label {
  font-size: 24rpx;
  color: #666;
}

/* 在线率卡片样式 */
.rate-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}
.rate-title {
  font-size: 30rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}
.rate-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #4CAF50;
  display: block;
  margin-bottom: 16rpx;
}
.rate-bar {
  background: #E0E0E0;
  border-radius: 20rpx;
  height: 24rpx;
  overflow: hidden;
}
.rate-fill {
  background: #4CAF50;
  height: 100%;
  width: 0%;
  border-radius: 20rpx;
  transition: width 0.3s ease;
}

/* Ajax 演示卡片样式 */
.api-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}
.api-title {
  font-size: 30rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 12rpx;
}
.api-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 20rpx;
}
.api-btn {
  background: #007AFF;
  color: white;
  border-radius: 12rpx;
  font-size: 28rpx;
  padding: 15rpx 0;
  width: 100%;
  margin-bottom: 20rpx;
}
.quote-box {
  background: #F0F7FF;
  border-radius: 12rpx;
  padding: 20rpx;
  border-left: 6rpx solid #007AFF;
}
.quote-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  display: block;
}
.quote-from {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
  text-align: right;
}
.hint-text {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 24rpx;
}

/* 设备列表区域样式 */
.device-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #F0F0F0;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}
.toggle-btn {
  font-size: 26rpx;
  color: #007AFF;
  padding: 10rpx 20rpx;
  background: #F0F7FF;
  border-radius: 30rpx;
}
.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #F0F0F0;
}
.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.device-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}
.device-type {
  font-size: 22rpx;
  color: #999;
}
.device-location {
  font-size: 22rpx;
  color: #aaa;
  margin-top: 4rpx;
}
.preview-list {
  max-height: 400rpx;
}
.preview-more {
  text-align: center;
  padding: 20rpx;
  color: #007AFF;
  font-size: 24rpx;
  background: #F0F7FF;
  border-radius: 30rpx;
  margin-top: 10rpx;
}
.full-list {
  max-height: 500rpx;
}
.online-text {
  color: #4CAF50;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  background: #E8F5E9;
  border-radius: 20rpx;
}
.offline-text {
  color: #F44336;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  background: #FFEBEE;
  border-radius: 20rpx;
}
.bottom-space {
  height: 40rpx;
}
</style>
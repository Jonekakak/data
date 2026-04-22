<template>
  <view class="device-card" @click="handleClick">
    <view class="card-header">
      <text class="device-name">{{ device.name }}</text>
      <view class="status-badge" :class="statusClass">
        <text class="status-text">{{ statusText }}</text>
      </view>
    </view>
    
    <view class="card-body">
      <view class="info-row">
        <text class="info-label">类型：</text>
        <text class="info-value">{{ device.type }}</text>
      </view>
      <view class="info-row" v-if="device.temperature !== null">
        <text class="info-label">温度：</text>
        <text class="info-value">{{ device.temperature }}°C</text>
      </view>
      <view class="info-row" v-if="device.humidity !== null">
        <text class="info-label">湿度：</text>
        <text class="info-value">{{ device.humidity }}%</text>
      </view>
      <view class="info-row">
        <text class="info-label">位置：</text>
        <text class="info-value">{{ device.location }}</text>
      </view>
      <view class="info-row time-row">
        <text class="time-text">更新：{{ device.lastUpdate }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DeviceCard',
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  computed: {
    statusClass() {
      return this.device.status === 'online' ? 'status-online' : 'status-offline';
    },
    statusText() {
      return this.device.status === 'online' ? '在线' : '离线';
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.device);
    }
  }
};
</script>

<style scoped>
.device-card {
  background-color: #fff;
  border-radius: 20rpx;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.device-card:active {
  transform: scale(0.98);
  background-color: #f9f9f9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.device-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.status-online {
  background-color: #e8f7e8;
  color: #2ba64a;
}

.status-offline {
  background-color: #ffe8e8;
  color: #e64340;
}

.status-text {
  font-size: 24rpx;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 28rpx;
}

.info-label {
  width: 100rpx;
  color: #999;
}

.info-value {
  color: #333;
  flex: 1;
}

.time-row {
  margin-top: 10rpx;
}

.time-text {
  color: #ccc;
  font-size: 22rpx;
}
</style>
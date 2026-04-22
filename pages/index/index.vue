<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <text class="title">设备监控</text>
      <view class="add-btn" @click="goToAdd">
        <text class="add-icon">+</text>
        <text class="add-text">添加</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="isLoading">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 设备列表 -->
    <scroll-view 
      v-else
      class="list-scroll" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态 -->
      <view class="empty-state" v-if="deviceList.length === 0">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无设备，点击添加按钮新增</text>
      </view>
      
     <!-- 设备卡片列表 -->
     <DeviceCard 
       v-for="device in displayList" 
       :key="device.id"
       :device="device"
       @click="goToDetail(device)"
     />
      
      <!-- 加载更多提示 -->
      <view class="load-more" v-if="deviceList.length > 0">
        <text>{{ hasMore ? '上拉加载更多' : '—— 没有更多了 ——' }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import DeviceCard from '@/components/DeviceCard.vue';
import { getDeviceList } from '@/utils/storage.js';

export default {
  components: {
    DeviceCard
  },
  data() {
    return {
      deviceList: [],
      displayList: [],
      isLoading: true,
      isRefreshing: false,
      pageSize: 10,
      currentPage: 1,
      hasMore: true,
      isNavigating: false  // 防止重复跳转
    };
  },
  async onLoad() {
    await this.loadDeviceList();
  },
  async onShow() {
    await this.loadDeviceList();
  },
  methods: {
    async loadDeviceList() {
      this.isLoading = true;
      try {
        const list = await getDeviceList();
        console.log('===== 首页获取到的设备列表 =====');
        console.log('列表长度:', list?.length);
        console.log('第一个设备:', list?.[0]);
        console.log('完整列表:', JSON.stringify(list, null, 2));
        
        this.deviceList = list || [];
        this.currentPage = 1;
        this.displayList = [];
        this.hasMore = true;
        this.loadMore();
      } catch (error) {
        console.error('加载设备列表失败:', error);
        uni.showToast({ title: '加载失败，请重试', icon: 'none' });
      } finally {
        this.isLoading = false;
      }
    },
    
    loadMore() {
      if (!this.hasMore) return;
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      const newItems = this.deviceList.slice(start, end);
      if (newItems.length < this.pageSize) {
        this.hasMore = false;
      }
      this.displayList = [...this.displayList, ...newItems];
      this.currentPage++;
    },
    
    async onRefresh() {
      this.isRefreshing = true;
      await this.loadDeviceList();
      this.isRefreshing = false;
      uni.showToast({ title: '刷新成功', icon: 'success', duration: 1000 });
    },
    
    goToDetail(device, index) {
      console.log('===== goToDetail 被调用 =====');
      console.log('传入的 device 对象:', device);
      console.log('索引 index:', index);
      console.log('device.id 的值:', device?.id);
      console.log('device.id 的类型:', typeof device?.id);
      
      // 防止重复跳转
      if (this.isNavigating) {
        console.log('正在跳转中，忽略本次点击');
        return;
      }
      
      // 获取设备 ID
      let deviceId = device?.id;
      
      // 如果 id 不存在，尝试使用索引 + 1
      if (!deviceId) {
        console.warn('device.id 不存在，使用索引作为 ID');
        deviceId = index + 1;
      }
      
      // 如果还是无效，报错
      if (!deviceId) {
        console.error('无法获取设备 ID！');
        uni.showToast({ title: '设备ID无效', icon: 'none' });
        return;
      }
      
      const url = `/pages/detail/detail?id=${deviceId}`;
      console.log('跳转 URL:', url);
      
      this.isNavigating = true;
      uni.navigateTo({
        url,
        complete: () => {
          setTimeout(() => {
            this.isNavigating = false;
          }, 500);
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          uni.showToast({ title: '页面跳转失败', icon: 'none' });
          this.isNavigating = false;
        }
      });
    },
    
    goToAdd() {
      if (this.isNavigating) return;
      this.isNavigating = true;
      uni.navigateTo({
        url: '/pages/add/add',
        complete: () => {
          setTimeout(() => {
            this.isNavigating = false;
          }, 500);
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx 20rpx;
  background-color: #fff;
  border-bottom: 2rpx solid #f0f0f0;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  display: flex;
  align-items: center;
  background-color: #007AFF;
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
}

.add-icon {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 8rpx;
}

.add-text {
  color: #fff;
  font-size: 26rpx;
}

.list-scroll {
  flex: 1;
  height: 0;
}

.loading-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-text {
  color: #999;
  font-size: 28rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
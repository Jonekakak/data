<template>
  <view class="container">
    <!-- 加载中 -->
    <view class="loading" v-if="isLoading">
      <text>加载中...</text>
    </view>

    <!-- 详情内容 -->
    <view class="detail-content" v-else>
      <!-- 设备名称 -->
      <view class="form-item">
        <text class="label">设备名称</text>
        <input 
          class="input" 
          v-model="device.name" 
          placeholder="请输入设备名称"
          :disabled="!isEditMode"
        />
      </view>

      <!-- 设备类型 -->
      <view class="form-item">
        <text class="label">设备类型</text>
        <picker 
          v-if="isEditMode"
          :range="typeOptions" 
          @change="onTypeChange"
          :value="typeIndex"
        >
          <view class="picker">{{ device.type || '请选择' }}</view>
        </picker>
        <text class="readonly-text" v-else>{{ device.type }}</text>
      </view>

      <!-- 安装位置 -->
      <view class="form-item">
        <text class="label">安装位置</text>
        <input 
          class="input" 
          v-model="device.location" 
          placeholder="请输入安装位置"
          :disabled="!isEditMode"
        />
      </view>

      <!-- 温度（仅温湿度传感器显示） -->
      <view class="form-item" v-if="device.type === '温湿度传感器'">
        <text class="label">温度 (°C)</text>
        <input 
          class="input" 
          v-model.number="device.temperature" 
          type="digit"
          placeholder="请输入温度"
          :disabled="!isEditMode"
        />
      </view>

      <!-- 湿度（仅温湿度传感器显示） -->
      <view class="form-item" v-if="device.type === '温湿度传感器'">
        <text class="label">湿度 (%)</text>
        <input 
          class="input" 
          v-model.number="device.humidity" 
          type="digit"
          placeholder="请输入湿度"
          :disabled="!isEditMode"
        />
      </view>

      <!-- 设备状态 -->
      <view class="form-item">
        <text class="label">设备状态</text>
        <view class="status-switch" @click="toggleStatus" v-if="isEditMode">
          <view class="status-badge" :class="device.status === 'online' ? 'status-online' : 'status-offline'">
            <text>{{ device.status === 'online' ? '在线' : '离线' }}</text>
          </view>
        </view>
        <text class="readonly-text" v-else>{{ device.status === 'online' ? '在线' : '离线' }}</text>
      </view>

      <!-- 最后更新时间 -->
      <view class="form-item">
        <text class="label">最后更新</text>
        <text class="readonly-text">{{ device.lastUpdate }}</text>
      </view>

      <!-- 按钮区域 -->
      <view class="button-group">
        <button 
          v-if="!isEditMode" 
          class="btn edit-btn" 
          @click="startEdit"
        >
          编辑
        </button>
        <button 
          v-if="isEditMode" 
          class="btn save-btn" 
          @click="saveDevice"
        >
          保存修改
        </button>
        <button 
          class="btn delete-btn" 
          @click="deleteDevice"
        >
          删除设备
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getDeviceById, updateDevice, deleteDevice } from '@/utils/storage.js';

export default {
  data() {
    return {
      device: {
        id: null,
        name: '',
        type: '',
        location: '',
        status: 'online',
        temperature: null,
        humidity: null,
        lastUpdate: ''
      },
      isLoading: true,
      isEditMode: false,
      typeOptions: ['温湿度传感器', '烟雾传感器', '门磁传感器'],
      typeIndex: 0,
      isSaving: false  // 防止重复保存
    };
  },
  async onLoad(options) {
    console.log('===== 详情页 onLoad 被调用了 =====');
    console.log('收到的参数 options:', options);
    const id = parseInt(options.id);
    console.log('解析后的 id:', id);
    
    if (id && !isNaN(id)) {
      await this.loadDevice(id);
    } else {
      console.error('没有收到有效的 id 参数！');
      uni.showToast({ title: '设备ID无效', icon: 'none' });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    // 加载设备详情
    async loadDevice(id) {
      console.log('开始加载设备, id:', id);
      this.isLoading = true;
      try {
        const device = await getDeviceById(id);
        console.log('获取到的设备数据:', device);
        
        if (device) {
          this.device = device;
          const idx = this.typeOptions.indexOf(device.type);
          if (idx !== -1) this.typeIndex = idx;
          console.log('设备加载成功:', this.device.name);
        } else {
          console.error('设备不存在, id:', id);
          uni.showToast({ title: '设备不存在', icon: 'none' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      } catch (error) {
        console.error('加载设备失败:', error);
        uni.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        this.isLoading = false;
      }
    },

    startEdit() {
      this.isEditMode = true;
    },

    onTypeChange(e) {
      this.typeIndex = e.detail.value;
      this.device.type = this.typeOptions[this.typeIndex];
    },

    toggleStatus() {
      this.device.status = this.device.status === 'online' ? 'offline' : 'online';
    },

    async saveDevice() {
      // 防止重复提交
      if (this.isSaving) return;
      
      if (!this.device.name.trim()) {
        uni.showToast({ title: '请输入设备名称', icon: 'none' });
        return;
      }
      if (!this.device.type) {
        uni.showToast({ title: '请选择设备类型', icon: 'none' });
        return;
      }
      if (!this.device.location.trim()) {
        uni.showToast({ title: '请输入安装位置', icon: 'none' });
        return;
      }

      this.isSaving = true;
      uni.showLoading({ title: '保存中...' });
      
      try {
        const updated = await updateDevice(this.device.id, {
          name: this.device.name,
          type: this.device.type,
          location: this.device.location,
          status: this.device.status,
          temperature: this.device.temperature,
          humidity: this.device.humidity
        });
        
        if (updated) {
          this.device = updated;
          this.isEditMode = false;
          uni.hideLoading();
          uni.showToast({ title: '保存成功', icon: 'success' });
          
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.loadDeviceList) {
            await prevPage.loadDeviceList();
          }
        }
      } catch (error) {
        console.error('保存失败:', error);
        uni.hideLoading();
        uni.showToast({ title: '保存失败', icon: 'none' });
      } finally {
        this.isSaving = false;
      }
    },

    async deleteDevice() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除设备「${this.device.name}」吗？`,
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '删除中...' });
            try {
              const result = await deleteDevice(this.device.id);
              if (result !== null) {
                uni.hideLoading();
                uni.showToast({ title: '删除成功', icon: 'success' });
                
                const pages = getCurrentPages();
                const prevPage = pages[pages.length - 2];
                if (prevPage && prevPage.loadDeviceList) {
                  await prevPage.loadDeviceList();
                }
                
                setTimeout(() => {
                  uni.navigateBack();
                }, 500);
              }
            } catch (error) {
              console.error('删除失败:', error);
              uni.hideLoading();
              uni.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.detail-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #fff;
}

.input[disabled] {
  background-color: #f5f5f5;
  color: #999;
}

.picker {
  padding: 20rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #fff;
}

.readonly-text {
  display: block;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.status-switch {
  display: inline-block;
}

.status-badge {
  display: inline-block;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  text-align: center;
}

.status-online {
  background-color: #e8f7e8;
  color: #2ba64a;
}

.status-offline {
  background-color: #ffe8e8;
  color: #e64340;
}

.button-group {
  display: flex;
  gap: 20rpx;
  margin-top: 60rpx;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

.edit-btn {
  background-color: #007AFF;
  color: #fff;
}

.save-btn {
  background-color: #2ba64a;
  color: #fff;
}

.delete-btn {
  background-color: #e64340;
  color: #fff;
}

.btn:active {
  opacity: 0.8;
}
</style>
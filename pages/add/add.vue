<template>
  <view class="container">
    <view class="form">
      <view class="item">
        <text>设备名称 *</text>
        <input 
          class="input-box"
          v-model="form.name"
          placeholder="请输入"
        />
      </view>

      <view class="item">
        <text>安装位置 *</text>
        <input 
          class="input-box"
          v-model="form.location"
          placeholder="请输入"
        />
      </view>

      <view class="item">
        <text>设备类型 *</text>
        <picker :range="types" @change="onTypeChange">
          <view class="picker-box">{{ form.type || "请选择" }}</view>
        </picker>
      </view>

      <button @click="submit">提交添加</button>
    </view>
  </view>
</template>

<script>
import { addDevice } from '@/utils/storage.js'

export default {
  data() {
    return {
      form: {
        name: '',
        location: '',
        type: ''
      },
      types: ["温湿度传感器", "烟雾传感器", "门磁传感器"]
    }
  },
  methods: {
    onTypeChange(e) {
      this.form.type = this.types[e.detail.value]
    },
    async submit() {
      console.log('提交的数据:', this.form)
      
      if (!this.form.name || !this.form.location || !this.form.type) {
        uni.showToast({ title: "请填写完整信息", icon: "none" })
        return
      }
      
      uni.showLoading({ title: '添加中...' })
      
      try {
        await addDevice({
          name: this.form.name,
          location: this.form.location,
          type: this.form.type,
          status: "online",
          temperature: null,
          humidity: null
        })
        
        uni.hideLoading()
        uni.showToast({ title: "添加成功", icon: "success" })
        
        // 刷新列表页
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage && prevPage.loadDeviceList) {
          await prevPage.loadDeviceList()
        }
        
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      } catch (error) {
        console.error('添加失败:', error)
        uni.hideLoading()
        uni.showToast({ title: "添加失败", icon: "none" })
      }
    }
  }
}
</script>

<style scoped>
.container { 
  padding: 30rpx; 
  background: #f5f5fa; 
  min-height: 100vh;
}
.item { 
  margin-bottom: 30rpx;
  background: #fff;
  padding: 20rpx;
  border-radius: 16rpx;
}
.item text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}
.input-box, .picker-box {
  border: 2rpx solid #eee;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #fff;
}
button { 
  margin-top: 60rpx; 
  background: #007AFF; 
  color: #fff; 
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
}
</style>
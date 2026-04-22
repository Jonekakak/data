// 设备数据管理（单例模式，确保所有页面数据一致）
let deviceList = [];

// 初始化：读取缓存，无数据则写入默认数据
function initDeviceStorage() {
  const cached = uni.getStorageSync('deviceList');
  if (cached && cached.length > 0) {
    deviceList = cached;
  } else {
    // 默认数据（和首页一致的4个设备）
    deviceList = [
      { id: 1, name: '温湿度传感器 A01', type: '温湿度传感器', status: 'online', temperature: 23.5, humidity: 65, location: '生产车间 A区', lastUpdate: new Date().toLocaleString() },
      { id: 2, name: '烟雾传感器 B02', type: '烟雾传感器', status: 'online', temperature: null, humidity: null, location: '仓库 B区', lastUpdate: new Date().toLocaleString() },
      { id: 3, name: '门磁传感器 C03', type: '门磁传感器', status: 'offline', temperature: null, humidity: null, location: '办公室大门', lastUpdate: new Date().toLocaleString() },
      { id: 4, name: '温湿度传感器 D04', type: '温湿度传感器', status: 'online', temperature: 22.8, humidity: 58, location: '实验室', lastUpdate: new Date().toLocaleString() }
    ];
    uni.setStorageSync('deviceList', deviceList);
  }
}
initDeviceStorage();

// 模拟请求延迟
function mockDelay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 获取所有设备
export async function getDeviceList() {
  await mockDelay();
  return [...deviceList];
}

// 添加设备
export async function addDevice(device) {
  await mockDelay();
  const newId = deviceList.length ? Math.max(...deviceList.map(d => d.id)) + 1 : 1;
  const newDevice = {
    ...device,
    id: newId,
    lastUpdate: new Date().toLocaleString()
  };
  deviceList.push(newDevice);
  uni.setStorageSync('deviceList', deviceList);
  return newDevice;
}

// 更新设备
export async function updateDevice(id, newData) {
  await mockDelay();
  const index = deviceList.findIndex(d => d.id === id);
  if (index === -1) return null;
  deviceList[index] = { ...deviceList[index], ...newData, lastUpdate: new Date().toLocaleString() };
  uni.setStorageSync('deviceList', deviceList);
  return deviceList[index];
}

// 删除设备
export async function deleteDevice(id) {
  await mockDelay();
  deviceList = deviceList.filter(d => d.id !== id);
  uni.setStorageSync('deviceList', deviceList);
  return [...deviceList];
}

// 根据ID获取设备
export async function getDeviceById(id) {
  await mockDelay();
  return deviceList.find(d => d.id === id) || null;
}
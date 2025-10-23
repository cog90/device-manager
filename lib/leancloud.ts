import AV from 'leancloud-storage';

// 初始化LeanCloud（提供字符串回退以通过类型检查）
const APP_ID: string = process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID || '';
const APP_KEY: string = process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY || '';
const SERVER_URL: string = process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL || '';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY,
  serverURL: SERVER_URL,
});

// 设备数据表
export const DeviceTable = AV.Object.extend('Devices');
// 用户数据表
export const UserTable = AV.Object.extend('users');

// 计算设备状态（安全解析 YYYY-MM-DD 字符串，避免不同环境解析差异）
export function calculateDeviceStatus(expiryDate?: string): 'normal' | 'expiring' | 'expired' {
  const parseYMD = (dateStr?: string) => {
    if (!dateStr) return NaN;
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
    if (!match) return NaN;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  };

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const expireTs = parseYMD(expiryDate);
  if (Number.isNaN(expireTs)) return 'expired';

  const diffDays = Math.ceil((expireTs - startOfToday) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'expiring';
  return 'normal';
}

// 创建设备
export async function createDevice(deviceData: {
  name: string;
  expiryDate: string;
  building: string;
  room: string;
}) {
  const device = new DeviceTable();
  device.set('name', deviceData.name);
  device.set('expiryDate', deviceData.expiryDate);
  device.set('building', deviceData.building);
  device.set('room', deviceData.room);
  device.set('location', `${deviceData.building}-${deviceData.room}`);
  
  return await device.save();
}

// 获取所有设备
export async function getAllDevices() {
  const query = new AV.Query(DeviceTable);
  query.descending('createdAt');
  const results = await query.find();
  
  return results.map(device => ({
    id: device.id,
    name: device.get('name'),
    expiryDate: device.get('expiryDate') || '',
    building: device.get('building'),
    room: device.get('room'),
    location: device.get('location'),
    status: calculateDeviceStatus(device.get('expiryDate')),
    createdAt: device.createdAt?.toISOString(),
    updatedAt: device.updatedAt?.toISOString(),
  }));
}

// 根据状态筛选设备
export async function getDevicesByStatus(status?: string) {
  const query = new AV.Query(DeviceTable);
  query.descending('createdAt');
  const results = await query.find();
  
  let devices = results.map(device => ({
    id: device.id,
    name: device.get('name'),
    expiryDate: device.get('expiryDate'),
    building: device.get('building'),
    room: device.get('room'),
    location: device.get('location'),
    status: calculateDeviceStatus(device.get('expiryDate')),
    createdAt: device.createdAt?.toISOString(),
    updatedAt: device.updatedAt?.toISOString(),
  }));
  
  if (status) {
    devices = devices.filter(device => device.status === status);
  }
  
  return devices;
}

// 根据ID获取设备
export async function getDeviceById(id: string) {
  const query = new AV.Query(DeviceTable);
  const device = await query.get(id);
  
  return {
    id: device.id,
    name: device.get('name'),
    expiryDate: device.get('expiryDate') || '',
    building: device.get('building'),
    room: device.get('room'),
    location: device.get('location'),
    status: calculateDeviceStatus(device.get('expiryDate')),
    createdAt: device.createdAt?.toISOString(),
    updatedAt: device.updatedAt?.toISOString(),
  };
}

// 更新设备
export async function updateDevice(id: string, deviceData: {
  name?: string;
  expiryDate?: string;
  building?: string;
  room?: string;
}) {
  const device = AV.Object.createWithoutData(DeviceTable, id);
  
  if (deviceData.name) device.set('name', deviceData.name);
  if (deviceData.expiryDate) device.set('expiryDate', deviceData.expiryDate);
  if (deviceData.building) device.set('building', deviceData.building);
  if (deviceData.room) device.set('room', deviceData.room);
  
  // 如果楼宇或房间有更新，重新计算位置
  if (deviceData.building || deviceData.room) {
    const currentBuilding = deviceData.building || await getDeviceById(id).then(d => d.building);
    const currentRoom = deviceData.room || await getDeviceById(id).then(d => d.room);
    device.set('location', `${currentBuilding}-${currentRoom}`);
  }
  
  return await device.save();
}

// 删除设备
export async function deleteDevice(id: string) {
  const device = AV.Object.createWithoutData(DeviceTable, id);
  return await device.destroy();
}

// 获取设备统计
export async function getDeviceStats() {
  const devices = await getAllDevices();
  
  const stats = {
    total: devices.length,
    normal: devices.filter(d => d.status === 'normal').length,
    expiring: devices.filter(d => d.status === 'expiring').length,
    expired: devices.filter(d => d.status === 'expired').length,
  };
  
  return stats;
}

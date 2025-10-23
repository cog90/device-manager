// 设备状态枚举
export enum DeviceStatus {
  NORMAL = 'normal',      // 正常（7天以上）
  EXPIRING = 'expiring',  // 即将过期（7天内）
  EXPIRED = 'expired'     // 已过期
}

// 设备接口定义
export interface Device {
  id?: string;
  name: string;
  expiryDate: string;
  building: string;
  room: string;
  location: string;
  status?: DeviceStatus;
  createdAt?: string;
  updatedAt?: string;
}

// 设备筛选选项
export interface DeviceFilter {
  status?: DeviceStatus;
  building?: string;
  search?: string;
}

// 设备统计信息
export interface DeviceStats {
  total: number;
  normal: number;
  expiring: number;
  expired: number;
}

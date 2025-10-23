'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllDevices, getDevicesByStatus, getDeviceStats } from '@/lib/leancloud';
import { Device, DeviceStatus, DeviceStats } from '@/lib/types';

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DeviceStats>({ total: 0, normal: 0, expiring: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status?: DeviceStatus;
    search?: string;
  }>({});

  const loadDevices = async () => {
    setLoading(true);
    try {
      const [devicesData, statsData] = await Promise.all([
        filter.status ? getDevicesByStatus(filter.status) : getAllDevices(),
        getDeviceStats()
      ]);
      
      let filteredDevices = devicesData;
      
      // 搜索筛选
      if (filter.search) {
        filteredDevices = devicesData.filter(device => 
          device.name.toLowerCase().includes(filter.search!.toLowerCase()) ||
          device.location.toLowerCase().includes(filter.search!.toLowerCase())
        );
      }
      
      setDevices(filteredDevices);
      setStats(statsData);
    } catch (error) {
      console.error('加载设备列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [filter]);

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.NORMAL:
        return 'bg-green-100 text-green-800';
      case DeviceStatus.EXPIRING:
        return 'bg-yellow-100 text-yellow-800';
      case DeviceStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.NORMAL:
        return '正常';
      case DeviceStatus.EXPIRING:
        return '即将过期';
      case DeviceStatus.EXPIRED:
        return '已过期';
      default:
        return '未知';
    }
  };

  const formatDate = (dateString: string) => {
    // 如果是 YYYY-MM-DD 直接返回，避免被时区影响
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? dateString : d.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">设备列表</h1>
          </div>
          <Link
            href="/add-device"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            添加设备
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-1">总设备数</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.normal}</div>
            <div className="text-sm text-gray-500 mt-1">正常</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.expiring}</div>
            <div className="text-sm text-gray-500 mt-1">即将过期</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-gray-500 mt-1">已过期</div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 状态筛选 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">状态筛选</label>
              <select
                value={filter.status || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as DeviceStatus || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部状态</option>
                <option value={DeviceStatus.NORMAL}>正常</option>
                <option value={DeviceStatus.EXPIRING}>即将过期</option>
                <option value={DeviceStatus.EXPIRED}>已过期</option>
              </select>
            </div>

            {/* 搜索 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
              <input
                type="text"
                placeholder="搜索设备名称或位置..."
                value={filter.search || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 设备列表 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {devices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">没有找到设备</h3>
              <p className="text-gray-500 mb-6">尝试调整筛选条件或添加新设备</p>
              <Link
                href="/add-device"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                添加设备
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {devices.map((device) => (
                <Link
                  key={device.id}
                  href={`/edit-device?id=${device.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.status!)}`}>
                          {getStatusText(device.status!)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">位置: {device.location}</div>
                      <div className="text-sm text-gray-500">到期时间: {formatDate(device.expiryDate)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {device.createdAt && `创建于 ${formatDate(device.createdAt)}`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
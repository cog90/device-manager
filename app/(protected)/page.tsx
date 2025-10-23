'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllDevices, getDeviceStats } from '@/lib/leancloud';
import { Device, DeviceStats } from '@/lib/types';

export default function Home() {
  const [stats, setStats] = useState<DeviceStats>({ total: 0, normal: 0, expiring: 0, expired: 0 });
  const [recentDevices, setRecentDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载设备统计信息
  useEffect(() => {
    const loadDeviceStats = async () => {
      try {
        setLoading(true);
        const [devicesData, statsData] = await Promise.all([
          getAllDevices(),
          getDeviceStats()
        ]);
        
        setStats(statsData);
        // 显示最近添加的5个设备
        setRecentDevices(devicesData.slice(0, 5));
      } catch (error) {
        console.error('加载设备统计失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeviceStats();
  }, []);

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
      <div className="max-w-4xl mx-auto">
        {/* 统计卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">设备概览</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">总设备数</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{stats.normal}</div>
              <div className="text-sm text-gray-500 mt-1">正常</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600">{stats.expiring}</div>
              <div className="text-sm text-gray-500 mt-1">即将过期</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-500 mt-1">已过期</div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex gap-3">
            <Link 
              href="/add-device" 
              className="flex-1 flex flex-col items-center p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors active:scale-95"
            >
              <span className="text-2xl mb-2">+</span>
              <span className="font-medium">添加设备</span>
            </Link>
            <Link 
              href="/device-list" 
              className="flex-1 flex flex-col items-center p-6 bg-gray-100 text-blue-600 rounded-xl hover:bg-gray-200 transition-colors active:scale-95"
            >
              <span className="text-2xl mb-2">📋</span>
              <span className="font-medium">查看全部</span>
            </Link>
          </div>
        </div>

        {/* 最近设备 */}
        {recentDevices.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">最近添加</h3>
              <Link href="/device-list" className="text-blue-600 text-sm font-medium">
                查看全部
              </Link>
            </div>
            <div className="space-y-3">
              {recentDevices.map((device) => (
                <Link 
                  key={device.id}
                  href={`/edit-device?id=${device.id}`}
                  className="flex justify-between items-center py-4 px-2 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{device.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{device.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {/^\d{4}-\d{2}-\d{2}$/.test(device.expiryDate) ? device.expiryDate : (Number.isNaN(new Date(device.expiryDate).getTime()) ? device.expiryDate : new Date(device.expiryDate).toLocaleDateString('zh-CN'))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {stats.total === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">📱</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">还没有设备</h3>
            <p className="text-gray-500 mb-8">点击下方按钮添加第一个设备</p>
            <Link 
              href="/add-device" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              添加设备
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}



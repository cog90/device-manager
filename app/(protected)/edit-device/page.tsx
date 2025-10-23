'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getDeviceById, updateDevice, deleteDevice } from '@/lib/leancloud';
import { Device } from '@/lib/types';

export default function EditDevice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    expiryDate: '',
    building: '',
    room: ''
  });

  const loadDevice = async () => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      const deviceData = await getDeviceById(deviceId);
      setDevice(deviceData);
      setFormData({
        name: deviceData.name,
        expiryDate: deviceData.expiryDate,
        building: deviceData.building,
        room: deviceData.room
      });
    } catch (error) {
      console.error('加载设备失败:', error);
      alert('加载设备失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevice();
  }, [deviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) return;
    
    setSaving(true);
    try {
      await updateDevice(deviceId, formData);
      router.push('/device-list');
    } catch (error) {
      console.error('更新设备失败:', error);
      alert('更新设备失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deviceId) return;
    
    if (!confirm('确定要删除这个设备吗？此操作不可撤销。')) {
      return;
    }
    
    setDeleting(true);
    try {
      await deleteDevice(deviceId);
      router.push('/device-list');
    } catch (error) {
      console.error('删除设备失败:', error);
      alert('删除设备失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return '正常';
      case 'expiring':
        return '即将过期';
      case 'expired':
        return '已过期';
      default:
        return '未知';
    }
  };

  const formatDate = (dateString: string) => {
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

  if (!device) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-50">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">设备不存在</h3>
          <p className="text-gray-500 mb-6">请检查设备ID是否正确</p>
          <Link
            href="/device-list"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            返回设备列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/device-list" 
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">编辑设备</h1>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deleting ? '删除中...' : '删除设备'}
          </button>
        </div>

        {/* 设备状态 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{device.name}</h2>
              <p className="text-gray-500 mt-1">位置: {device.location}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(device.status!)}`}>
              {getStatusText(device.status!)}
            </span>
          </div>
        </div>

        {/* 编辑表单 */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 设备名称 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                设备名称 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black placeholder-gray-400"
                placeholder="请输入设备名称"
                required
              />
            </div>

            {/* 到期时间 */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                到期时间 *
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black placeholder-gray-400"
                required
              />
            </div>

            {/* 楼宇 */}
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                楼宇 *
              </label>
              <input
                type="text"
                id="building"
                name="building"
                value={formData.building}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black placeholder-gray-400"
                placeholder="请输入楼宇名称"
                required
              />
            </div>

            {/* 房间 */}
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
                房间 *
              </label>
              <input
                type="text"
                id="room"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black placeholder-gray-400"
                placeholder="请输入房间号"
                required
              />
            </div>

            {/* 位置预览 */}
            {formData.building && formData.room && (
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-sm text-blue-600 font-medium mb-1">位置预览</div>
                <div className="text-blue-800">{formData.building}-{formData.room}</div>
              </div>
            )}

            {/* 按钮组 */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/device-list"
                className="flex-1 px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '保存中...' : '保存更改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
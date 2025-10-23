'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createDevice } from '@/lib/leancloud';

export default function AddDevice() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    expiryDate: '',
    building: '',
    room: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate || !formData.building || !formData.room) {
      alert('请填写所有必填字段');
      return;
    }

    setLoading(true);
    try {
      await createDevice(formData);
      router.push('/device-list');
    } catch (error) {
      console.error('创建设备失败:', error);
      alert('创建设备失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center mb-8">
          <Link 
            href="/" 
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">添加设备</h1>
        </div>

        {/* 表单 */}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
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
                href="/"
                className="flex-1 px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '创建中...' : '创建设备'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



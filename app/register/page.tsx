'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '', 
    inviteCode: '' 
  });
  const [validation, setValidation] = useState({
    username: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
    inviteCode: { isValid: true, message: '' }
  });
  const [showInviteHelp, setShowInviteHelp] = useState(false);

  // 验证用户名
  const validateUsername = async (username: string) => {
    if (!username.trim()) {
      setValidation(prev => ({
        ...prev,
        username: { isValid: false, message: '用户名不能为空' }
      }));
      return false;
    }
    
    if (username.length < 3 || username.length > 20) {
      setValidation(prev => ({
        ...prev,
        username: { isValid: false, message: '用户名长度必须在3-20个字符之间' }
      }));
      return false;
    }

    // 检查用户名是否已存在
    try {
      const res = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      
      if (data.exists) {
        setValidation(prev => ({
          ...prev,
          username: { isValid: false, message: '用户名已存在，请选择其他用户名' }
        }));
        return false;
      } else {
        setValidation(prev => ({
          ...prev,
          username: { isValid: true, message: '' }
        }));
        return true;
      }
    } catch (error) {
      setValidation(prev => ({
        ...prev,
        username: { isValid: false, message: '检查用户名时出错，请重试' }
      }));
      return false;
    }
  };

  // 验证密码
  const validatePassword = (password: string) => {
    if (!password) {
      setValidation(prev => ({
        ...prev,
        password: { isValid: false, message: '密码不能为空' }
      }));
      return false;
    }
    
    if (password.length < 6 || password.length > 15) {
      setValidation(prev => ({
        ...prev,
        password: { isValid: false, message: '密码长度必须在6-15个字符之间' }
      }));
      return false;
    }
    
    setValidation(prev => ({
      ...prev,
      password: { isValid: true, message: '' }
    }));
    return true;
  };

  // 验证确认密码
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: '请确认密码' }
      }));
      return false;
    }
    
    if (confirmPassword !== form.password) {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: '两次输入的密码不一致' }
      }));
      return false;
    }
    
    setValidation(prev => ({
      ...prev,
      confirmPassword: { isValid: true, message: '' }
    }));
    return true;
  };

  // 用户名输入处理（防抖）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.username && form.username.length >= 3) {
        validateUsername(form.username);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [form.username]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 验证所有字段
    const isUsernameValid = await validateUsername(form.username);
    const isPasswordValid = validatePassword(form.password);
    const isConfirmPasswordValid = validateConfirmPassword(form.confirmPassword);
    
    if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          inviteCode: form.inviteCode
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '注册失败');
      router.push('/');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">注册</h1>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</div>
        )}
        <form onSubmit={submit} className="space-y-5">
          {/* 用户名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <input
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 ${
                validation.username.isValid 
                  ? 'border-gray-300' 
                  : 'border-red-300 focus:ring-red-500'
              }`}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="请输入用户名（3-20个字符）"
            />
            {!validation.username.isValid && (
              <p className="mt-1 text-sm text-red-600">{validation.username.message}</p>
            )}
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <input
              type="password"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 ${
                validation.password.isValid 
                  ? 'border-gray-300' 
                  : 'border-red-300 focus:ring-red-500'
              }`}
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                validatePassword(e.target.value);
              }}
              placeholder="请输入密码（6-15个字符）"
            />
            {!validation.password.isValid && (
              <p className="mt-1 text-sm text-red-600">{validation.password.message}</p>
            )}
          </div>

          {/* 确认密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
            <input
              type="password"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 ${
                validation.confirmPassword.isValid 
                  ? 'border-gray-300' 
                  : 'border-red-300 focus:ring-red-500'
              }`}
              value={form.confirmPassword}
              onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                validateConfirmPassword(e.target.value);
              }}
              placeholder="请再次输入密码"
            />
            {!validation.confirmPassword.isValid && (
              <p className="mt-1 text-sm text-red-600">{validation.confirmPassword.message}</p>
            )}
          </div>

          {/* 认证码 */}
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">认证码</label>
              <button
                type="button"
                className="ml-2 w-5 h-5 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center hover:bg-gray-500"
                onClick={() => setShowInviteHelp(!showInviteHelp)}
                title="点击查看帮助"
              >
                ?
              </button>
            </div>
            {showInviteHelp && (
              <div className="mb-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                认证码请联系管理员获取
              </div>
            )}
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
              value={form.inviteCode}
              onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
              placeholder="请输入认证码"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div className="text-center text-sm text-gray-500 mt-6">
          已有账号？<Link href="/login" className="text-blue-600">去登录</Link>
        </div>
      </div>
    </div>
  );
}



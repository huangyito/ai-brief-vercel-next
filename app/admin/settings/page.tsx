'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type PushConfig = {
  id: string;
  pushTime: string;
  timezone: string;
  isEnabled: boolean;
  updatedAt: string;
};

export default function SettingsPage() {
  const [config, setConfig] = useState<PushConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    pushTime: '09:00',
    timezone: 'Asia/Shanghai',
    isEnabled: true
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/push-config');
      const data = await response.json();
      setConfig(data);
      setFormData({
        pushTime: data.pushTime || '09:00',
        timezone: data.timezone || 'Asia/Shanghai',
        isEnabled: data.isEnabled !== undefined ? data.isEnabled : true
      });
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/api/admin/push-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('配置保存成功！');
        fetchConfig();
      } else {
        alert('配置保存失败，请重试');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{padding: '20px', textAlign: 'center'}}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{marginBottom: '30px'}}>
        <h1 style={{margin: '0 0 10px', fontSize: '28px'}}>推送配置</h1>
        <Link href="/admin" style={{
          color: '#2667ff',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          ← 返回管理
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e1e5e9',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{marginBottom: '20px'}}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333'
          }}>
            推送时间:
          </label>
          <input
            type="time"
            value={formData.pushTime}
            onChange={(e) => setFormData({...formData, pushTime: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{marginBottom: '20px'}}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333'
          }}>
            时区:
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({...formData, timezone: e.target.value})}
            style={{
              width: '20px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
          </select>
        </div>
        
        <div style={{marginBottom: '20px'}}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({...formData, isEnabled: e.target.checked})}
              style={{width: 'auto'}}
            />
            <span style={{fontWeight: '600', color: '#333'}}>启用自动推送</span>
          </label>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '24px'
        }}>
          <Link href="/admin" style={{
            padding: '10px 16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#666',
            background: '#f5f5f5'
          }}>
            取消
          </Link>
          <button 
            type="submit" 
            disabled={saving}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              background: '#2667ff',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </form>
      
      {config && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '24px'
        }}>
          <h3 style={{margin: '0 0 16px', fontSize: '18px'}}>当前配置</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
            <div>
              <strong>推送时间:</strong> {config.pushTime}
            </div>
            <div>
              <strong>时区:</strong> {config.timezone}
            </div>
            <div>
              <strong>状态:</strong> {config.isEnabled ? '启用' : '禁用'}
            </div>
            <div>
              <strong>最后更新:</strong> {new Date(config.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

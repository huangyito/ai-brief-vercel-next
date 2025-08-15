'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const styles = `
:root{
  --bg:#0b0f16; --panel:#0f1624; --panel-2:#121a2a; --text:#e6ecff; --muted:#9fb0cf;
  --brand:#5aa9ff; --accent:#7ef0ff; --ok:#63f3a6; --warn:#ffd166; --bad:#ff6b6b; --chip:#1a2132;
  --border:rgba(255,255,255,.08);
  --shadow:0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03);
  --radius:16px;
}
.light{ --bg:#f7f9fc; --panel:#ffffff; --panel-2:#f0f3f9; --text:#0f1624; --muted:#5b6780; --brand:#2667ff; --accent:#1aa6b7; --chip:#e9eef7; --border:rgba(10,20,30,.08); --shadow:0 10px 28px rgba(16,34,64,.08), inset 0 1px 0 rgba(255,255,255,.6); }
*{box-sizing:border-box}
html,body{height:100%}

html{background:var(--bg)}

body{
  margin:0;
  background:
    radial-gradient(1200px 600px at 80% -100px, rgba(90,169,255,.18), transparent 60%),
    radial-gradient(900px 600px at -10% -50px, rgba(126,240,255,.12), transparent 60%),
    var(--bg);
  color:var(--text);
  font:16px/1.65 system-ui,-apple-system,Segoe UI,Roboto,PingFang SC,"Microsoft YaHei",Helvetica,Arial,"Noto Sans",sans-serif;
  letter-spacing:.2px;
}

.light html{background:var(--bg)}
.light body{
  background:
    radial-gradient(1200px 600px at 80% -100px, rgba(38,103,255,.08), transparent 60%),
    radial-gradient(900px 600px at -10% -50px, rgba(26,166,183,.06), transparent 60%),
    var(--bg);
}

.wrap{max-width:1200px; margin:48px auto; padding:0 20px; background:var(--bg)}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:32px;}
.brand{display:flex; align-items:center; gap:14px}
.logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 10px 20px rgba(90,169,255,.25); position:relative; isolation:isolate;}
.logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.title{font-size:28px; font-weight:700; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:16px; margin-top:8px}

.back-link{color:var(--brand); text-decoration:none; font-size:14px; opacity:.8; padding:8px 12px; border:1px solid var(--border); border-radius:8px; background:var(--panel); transition:all 0.2s ease}
.back-link:hover{opacity:1; transform:translateY(-1px)}

.btn{appearance:none; border:1px solid var(--border); background:var(--panel-2); color:var(--text); padding:10px 16px; border-radius:12px; cursor:pointer; transition:all 0.2s ease; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; justify-content:center}
.btn:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.btn.primary{background:var(--brand); color:white; border-color:var(--brand)}
.btn.secondary{background:var(--panel-2); color:var(--text); border-color:var(--border)}
.btn.danger{background:var(--bad); color:white; border-color:var(--bad)}
.btn.small{padding:6px 12px; font-size:13px}

.models-table{border:1px solid var(--border); background:var(--panel); border-radius:var(--radius); box-shadow:var(--shadow); overflow:hidden; margin-top:24px}
.table-header{background:var(--panel-2); padding:16px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between}
.table-header h3{margin:0; font-size:18px}
.table-header .actions{display:flex; gap:12px}

.table-row{display:grid; grid-template-columns:1fr 100px 100px 120px 120px; gap:20px; padding:16px 20px; border-bottom:1px solid var(--border); align-items:center}
.table-row:last-child{border-bottom:none}
.table-row:hover{background:var(--panel-2)}
.table-row .name{font-weight:600}
.table-row .status{display:flex; align-items:center; gap:8px}
.status-dot{width:8px; height:8px; border-radius:50%}
.status-dot.active{background:var(--ok)}
.status-dot.inactive{background:var(--muted)}
.table-row .priority{text-align:center; font-weight:600; color:var(--brand)}
.table-row .actions{display:flex; gap:8px}

.empty-state{text-align:center; padding:60px 20px; color:var(--muted)}
.empty-state h3{margin:0 0 16px; font-size:20px}
.empty-state p{margin:0 0 24px; opacity:.8}

.modal{position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:1000}
.modal-content{background:var(--panel); border-radius:var(--radius); padding:24px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto}
.modal-header{display:flex; align-items:center; justify-content:space-between; margin-bottom:20px}
.modal-header h3{margin:0; font-size:20px}
.modal-close{background:none; border:none; color:var(--muted); cursor:pointer; font-size:20px; padding:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:8px; transition:all 0.2s ease}
.modal-close:hover{background:var(--panel-2); color:var(--text)}

.form-group{margin-bottom:20px}
.form-group label{display:block; margin-bottom:8px; font-weight:600; color:var(--text)}
.form-group input, .form-group select{width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; background:var(--panel-2); color:var(--text); font-size:14px}
.form-group input:focus, .form-group select:focus{outline:none; border-color:var(--brand)}
.form-group .checkbox{display:flex; align-items:center; gap:8px}
.form-group .checkbox input{width:auto}

.modal-actions{display:flex; gap:12px; justify-content:flex-end; margin-top:24px}
`;

type ModelConfig = {
  id: string;
  name: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

export default function ModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    priority: 1,
    isActive: true
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/admin/models');
      const data = await response.json();
      setModels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = () => {
    setEditingModel(null);
    setFormData({ name: '', priority: 1, isActive: true });
    setShowModal(true);
  };

  const handleEditModel = (model: ModelConfig) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      priority: model.priority,
      isActive: model.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingModel) {
        // 更新模型
        await fetch('/api/admin/models', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingModel.id,
            ...formData
          })
        });
      } else {
        // 添加模型
        await fetch('/api/admin/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      
      setShowModal(false);
      fetchModels();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('确定要删除这个模型吗？')) return;
    
    try {
      await fetch(`/api/admin/models?id=${id}`, { method: 'DELETE' });
      fetchModels();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleToggleStatus = async (model: ModelConfig) => {
    try {
      await fetch('/api/admin/models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: model.id,
          isActive: !model.isActive
        })
      });
      fetchModels();
    } catch (error) {
      console.error('状态更新失败:', error);
      alert('状态更新失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="light">
        <style dangerouslySetInnerHTML={{__html: styles}} />
        <div className="wrap">
          <div style={{textAlign: 'center', padding: '60px 20px'}}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="light">
      <style dangerouslySetInnerHTML={{__html: styles}} />
      <div className="wrap">
        <header>
          <div className="brand">
            <div className="logo"></div>
            <div>
              <h1 className="title">AI模型管理</h1>
              <div className="subtitle">管理需要关注的AI模型</div>
            </div>
          </div>
          <Link href="/admin" className="back-link">
            ← 返回管理
          </Link>
        </header>

        <div className="models-table">
          <div className="table-header">
            <h3>模型列表</h3>
            <div className="actions">
              <button onClick={handleAddModel} className="btn primary">
                + 添加模型
              </button>
            </div>
          </div>

          {models.length === 0 ? (
            <div className="empty-state">
              <h3>暂无模型</h3>
              <p>点击"添加模型"开始管理AI模型</p>
              <button onClick={handleAddModel} className="btn primary">
                添加第一个模型
              </button>
            </div>
          ) : (
            <>
              <div className="table-row" style={{fontWeight: '600', background: 'var(--panel-2)'}}>
                <div>模型名称</div>
                <div>状态</div>
                <div>优先级</div>
                <div>创建时间</div>
                <div>操作</div>
              </div>
              
              {models.map((model) => (
                <div key={model.id} className="table-row">
                  <div className="name">{model.name}</div>
                  <div className="status">
                    <div className={`status-dot ${model.isActive ? 'active' : 'inactive'}`}></div>
                    {model.isActive ? '启用' : '禁用'}
                  </div>
                  <div className="priority">{model.priority}</div>
                  <div>{new Date(model.createdAt).toLocaleDateString()}</div>
                  <div className="actions">
                    <button 
                      onClick={() => handleToggleStatus(model)} 
                      className={`btn small ${model.isActive ? 'secondary' : 'primary'}`}
                    >
                      {model.isActive ? '禁用' : '启用'}
                    </button>
                    <button 
                      onClick={() => handleEditModel(model)} 
                      className="btn small secondary"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleDeleteModel(model.id)} 
                      className="btn small danger"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* 添加/编辑模型弹窗 */}
        {showModal && (
          <div className="modal" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingModel ? '编辑模型' : '添加模型'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>模型名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="输入模型名称"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>优先级</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                  >
                    <option value={1}>1 - 最高</option>
                    <option value={2}>2 - 高</option>
                    <option value={3}>3 - 中</option>
                    <option value={4}>4 - 低</option>
                    <option value={5}>5 - 最低</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <div className="checkbox">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label htmlFor="isActive">启用此模型</label>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn secondary">
                    取消
                  </button>
                  <button type="submit" className="btn primary">
                    {editingModel ? '更新' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from '../../components/ThemeProvider';

// 导入全局主题切换组件
import { ThemeToggle } from '../../components/ThemeToggle';
import ColorfulModelIcon from '../../components/ColorfulModelIcon';

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
    radial-gradient(800px 400px at 50% -100px, rgba(90,169,255,.12), transparent 70%),
    radial-gradient(600px 400px at 50% -50px, rgba(126,240,255,.08), transparent 70%),
    var(--bg);
  color:var(--text);
  font:16px/1.65 system-ui,-apple-system,Segoe UI,Roboto,PingFang SC,"Microsoft YaHei",Helvetica,Arial,"Noto Sans",sans-serif;
  letter-spacing:.2px;
  overflow-x: hidden;
}

.light html{background:var(--bg)}
.light body{
  background:
    radial-gradient(800px 400px at 50% -100px, rgba(38,103,255,.06), transparent 70%),
    radial-gradient(600px 400px at 50% -50px, rgba(26,166,183,.04), transparent 70%),
    var(--bg);
  overflow-x: hidden;
}

.wrap{max-width:1200px; margin:48px auto; padding:0 20px; background:var(--bg)}
header{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:32px;}
.brand{display:flex; align-items:center; gap:14px}
.logo{width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, var(--brand), var(--accent)); box-shadow:0 10px 20px rgba(90,169,255,.25); position:relative; isolation:isolate;}
.logo:after{content:""; position:absolute; inset:2px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,0)); mix-blend:screen}
.title{font-size:28px; font-weight:700; letter-spacing:.3px}
.subtitle{color:var(--muted); font-size:16px; margin-top:8px}

.back-link{color:var(--brand); text-decoration:none; font-size:14px; opacity:.8; padding:8px; border:1px solid var(--border); border-radius:12px; background:var(--panel); transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; min-width:36px; height:36px}
.back-link:hover{opacity:1; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}

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

.btn-icon{display:flex; align-items:center; justify-content:center; background:var(--panel-2); border:1px solid var(--border); border-radius:12px; padding:8px; cursor:pointer; transition:all 0.2s ease}

/* 模型管理区域样式 */
.models-section{margin:24px 0; padding:24px; background:var(--panel); border-radius:var(--radius); border:1px solid var(--border); box-shadow:var(--shadow)}
.section-header{display:flex; align-items:center; justify-content:space-between; margin-bottom:20px}
.section-header h3{margin:0; font-size:18px; color:var(--text)}
.section-header .count{color:var(--muted); font-size:14px; font-weight:500}

.models-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:12px}
.model-card{display:flex; align-items:center; gap:12px; padding:12px 16px; background:var(--panel-2); border:2px solid var(--border); border-radius:10px; cursor:pointer; transition:all 0.2s ease; position:relative; min-height:60px}
.model-card:hover{transform:translateY(-1px); box-shadow:0 2px 12px rgba(0,0,0,.1)}
.model-card.used{border-color:var(--ok)}
.model-card.unused{border-color:var(--border)}
.model-card.used:hover{border-color:var(--bad)}
.model-card.unused:hover{border-color:var(--brand)}

.model-icon{display:flex; align-items:center; justify-content:center; width:32px; height:32px; background:var(--panel); border-radius:6px; padding:4px; flex-shrink:0}
.model-name{font-size:14px; font-weight:600; color:var(--text); flex:1; text-align:left}
.model-content{flex:1; display:flex; flex-direction:column; gap:4px}
.model-status{display:flex; gap:6px; align-items:center}
.status-badge{font-size:10px; padding:1px 6px; border-radius:8px; font-weight:500}
.status-badge.active{background:var(--ok); color:white}
.status-badge.inactive{background:var(--muted); color:white}
.priority-badge{font-size:10px; color:var(--brand); font-weight:500}

.custom-models{margin:24px 0; padding:20px; background:var(--panel-2); border-radius:12px; border:1px solid var(--border)}
.custom-models .section-desc{color:var(--muted); font-size:14px; margin:12px 0 0; opacity:0.8}
.btn-icon:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1)}
.btn-icon svg{width:16px; height:16px; color:var(--brand)}
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
  const { theme } = useTheme();

  // 基础 AI 模型列表 - 核心品牌模型
  const baseModels = [
    // 国际主流 AI 模型
    { name: 'ChatGPT', icon: 'OpenAI' },
    { name: 'Claude', icon: 'Claude' },
    { name: 'Gemini', icon: 'Google' },
    { name: 'LLaMA', icon: 'Meta' },
    { name: 'Mistral', icon: 'Mistral' },
    { name: 'Grok', icon: 'Grok' },
    { name: 'Copilot', icon: 'Microsoft' },
    
    // 中国主流 AI 模型
    { name: '文心一言', icon: 'Alibaba' },
    { name: '通义千问', icon: 'Alibaba' },
    { name: '豆包', icon: 'ByteDance' },
    { name: '讯飞星火', icon: 'Spark' },
    { name: 'Kimi', icon: 'ByteDance' },
    
    // 专业领域 AI 模型
    { name: 'DALL-E', icon: 'OpenAI' },
    { name: 'Midjourney', icon: 'OpenAI' },
    { name: 'Stable Diffusion', icon: 'Stability' },
    { name: 'Whisper', icon: 'OpenAI' },
    { name: 'Codex', icon: 'OpenAI' },
    { name: 'Code Llama', icon: 'Meta' },
    { name: 'GitHub Copilot', icon: 'Microsoft' },
    { name: 'Bing Chat', icon: 'Microsoft' },
    
    // 企业级 AI 服务
    { name: 'Azure OpenAI', icon: 'Microsoft' },
    { name: 'AWS Bedrock', icon: 'AWS' },
    { name: 'Google Cloud AI', icon: 'Google' },
    { name: 'IBM Watson', icon: 'IBM' },
    { name: 'Oracle AI', icon: 'Oracle' },
    
    // 开源 AI 模型
    { name: 'Falcon', icon: 'Mistral' },
    { name: 'BLOOM', icon: 'Mistral' },
    { name: 'T5', icon: 'Google' },
    { name: 'BERT', icon: 'Google' },
    { name: 'GPT-J', icon: 'OpenAI' },
    { name: 'GPT-Neo', icon: 'OpenAI' },
    { name: 'OPT', icon: 'Meta' },
    
    // 多模态 AI 模型
    { name: 'GPT-4V', icon: 'OpenAI' },
    { name: 'Claude 3 Vision', icon: 'Claude' },
    { name: 'Gemini Pro Vision', icon: 'Google' },
    { name: 'LLaVA', icon: 'LLaVA' },
    { name: 'InstructBLIP', icon: 'Meta' },
    { name: 'CogVLM', icon: 'Meta' },
    
    // 代码生成 AI 模型
    { name: 'CodeGeeX', icon: 'CodeGeeX' },
    { name: 'CodeT5', icon: 'Google' },
    { name: 'PLBART', icon: 'Google' },
    { name: 'CodeBERT', icon: 'Google' },
    { name: 'GraphCodeBERT', icon: 'Google' },
    
    // 对话 AI 模型
    { name: 'BlenderBot', icon: 'Anthropic' },
    { name: 'DialoGPT', icon: 'OpenAI' },
    { name: 'Meena', icon: 'Google' },
    { name: 'LaMDA', icon: 'Google' },
    { name: 'ChatGLM', icon: 'ChatGLM' },
    { name: 'Baichuan', icon: 'Baichuan' },
    
    // 知识问答 AI 模型
    { name: 'RAG', icon: 'Anthropic' },
    { name: 'Retrieval-Augmented', icon: 'Anthropic' },
    { name: 'REPLUG', icon: 'Anthropic' },
    { name: 'Atlas', icon: 'Anthropic' },
    { name: 'FiD', icon: 'Anthropic' },
    
    // 创意写作 AI 模型
    { name: 'Jasper', icon: 'OpenAI' },
    { name: 'Copy.ai', icon: 'OpenAI' },
    { name: 'Writesonic', icon: 'OpenAI' },
    { name: 'Rytr', icon: 'OpenAI' },
    { name: 'ContentBot', icon: 'OpenAI' },
    
    // 数据分析 AI 模型
    { name: 'Pandas AI', icon: 'Google' },
    { name: 'DataRobot', icon: 'Google' },
    { name: 'H2O.ai', icon: 'Google' },
    { name: 'RapidMiner', icon: 'Google' },
    { name: 'KNIME', icon: 'Google' },
    
    // 设计 AI 模型
    { name: 'Canva AI', icon: 'OpenAI' },
    { name: 'Figma AI', icon: 'Figma' },
    { name: 'Adobe Firefly', icon: 'Adobe' },
    { name: 'Sketch AI', icon: 'OpenAI' },
    { name: 'Affinity AI', icon: 'OpenAI' },
    
    // 视频生成 AI 模型
    { name: 'Runway', icon: 'Runway' },
    { name: 'Pika Labs', icon: 'OpenAI' },
    { name: 'Synthesia', icon: 'OpenAI' },
    { name: 'Lumen5', icon: 'OpenAI' },
    { name: 'InVideo', icon: 'OpenAI' },
    
    // 音频 AI 模型
    { name: 'ElevenLabs', icon: 'ElevenLabs' },
    { name: 'Murf AI', icon: 'OpenAI' },
    { name: 'Descript', icon: 'OpenAI' },
    { name: 'Resemble AI', icon: 'OpenAI' },
    { name: 'Play.ht', icon: 'OpenAI' },
    
    // 3D 生成 AI 模型
    { name: 'Point-E', icon: 'OpenAI' },
    { name: 'GET3D', icon: 'OpenAI' },
    { name: 'Magic3D', icon: 'OpenAI' },
    { name: 'Shap-E', icon: 'OpenAI' },
    { name: 'Text2Mesh', icon: 'OpenAI' },
    
    // 科学计算 AI 模型
    { name: 'AlphaFold', icon: 'Google' },
    { name: 'AlphaCode', icon: 'Google' },
    { name: 'AlphaGo', icon: 'Google' },
    { name: 'AlphaZero', icon: 'Google' },
    { name: 'MuZero', icon: 'Google' },
    
    // 金融 AI 模型
    { name: 'BloombergGPT', icon: 'Anthropic' },
    { name: 'FinGPT', icon: 'Anthropic' },
    { name: 'GPT-Finance', icon: 'OpenAI' },
    { name: 'FinBERT', icon: 'Google' },
    { name: 'FinLAMA', icon: 'Meta' },
    
    // 医疗 AI 模型
    { name: 'Med-PaLM', icon: 'Google' },
    { name: 'Med-PaLM 2', icon: 'Google' },
    { name: 'ChatDoctor', icon: 'OpenAI' },
    { name: 'MedGPT', icon: 'OpenAI' },
    { name: 'HealthGPT', icon: 'OpenAI' },
    
    // 法律 AI 模型
    { name: 'LexiLaw', icon: 'Anthropic' },
    { name: 'LegalGPT', icon: 'OpenAI' },
    { name: 'CaseGPT', icon: 'OpenAI' },
    { name: 'LawBot', icon: 'Anthropic' },
    { name: 'JusticeAI', icon: 'Anthropic' },
    
    // 教育 AI 模型
    { name: 'Duolingo AI', icon: 'Google' },
    { name: 'Khan Academy AI', icon: 'Google' },
    { name: 'Coursera AI', icon: 'Google' },
    { name: 'EdX AI', icon: 'Google' },
    { name: 'Udemy AI', icon: 'Google' },
    
    // 游戏 AI 模型
    { name: 'Unity AI', icon: 'OpenAI' },
    { name: 'Unreal AI', icon: 'OpenAI' },
    { name: 'GameGPT', icon: 'OpenAI' },
    { name: 'NPC AI', icon: 'OpenAI' },
    { name: 'GameBot', icon: 'OpenAI' },
  ];

  // 获取已使用的模型名称列表
  const usedModelNames = useMemo(() => {
    const names = models.map(m => m.name);
    console.log('已使用的模型名称:', names);
    return names;
  }, [models]);
  
  // 过滤出未使用的模型
  const unusedModels = useMemo(() => {
    const unused = baseModels.filter(baseModel => 
      !usedModelNames.includes(baseModel.name)
    );
    console.log('未使用的模型:', unused);
    return unused;
  }, [baseModels, usedModelNames]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      console.log('开始获取模型列表...');
      const response = await fetch('/api/admin/models');
      const data = await response.json();
      console.log('获取到的模型数据:', data);
      setModels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setLoading(false);
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

  const handleQuickAdd = async (modelName: string) => {
    try {
      await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          priority: 1,
          isActive: true
        })
      });
      fetchModels();
    } catch (error) {
      console.error('快速添加失败:', error);
      alert('添加失败，请重试');
    }
  };

  // 添加模型到使用区
  const handleAddToUsed = async (modelName: string) => {
    console.log('开始添加模型:', modelName);
    try {
      const response = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          priority: 1,
          isActive: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('添加模型成功:', result);
      fetchModels();
    } catch (error) {
      console.error('添加模型失败:', error);
      alert('添加失败，请重试');
    }
  };

  // 从使用区移除模型
  const handleRemoveFromUsed = async (modelId: string) => {
    try {
      await fetch(`/api/admin/models?id=${modelId}`, { method: 'DELETE' });
      fetchModels();
    } catch (error) {
      console.error('移除模型失败:', error);
      alert('移除失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className={theme}>
        <style dangerouslySetInnerHTML={{__html: styles}} />
        <div className="wrap">
          <div style={{textAlign: 'center', padding: '60px 20px'}}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme}>
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ThemeToggle className="btn-icon" />
            <Link href="/admin" className="back-link">
              ← 返回管理
            </Link>
          </div>
        </header>

        {/* 已使用的模型区域 */}
        <div className="models-section used-models">
          <div className="section-header">
            <h3>正在使用的模型</h3>
            <span className="count">({models.length}个)</span>
          </div>
          
          {models.length === 0 ? (
            <div className="empty-state">
              <p>暂无正在使用的模型，从下方选择模型添加到使用区</p>
            </div>
          ) : (
            <div className="models-grid">
              {models.map((model) => (
                <div key={model.id} className="model-card used" onClick={() => handleRemoveFromUsed(model.id)}>
                  <div className="model-icon">
                    <ColorfulModelIcon model={model.name} size={20} />
                  </div>
                  <div className="model-content">
                    <div className="model-name">{model.name}</div>
                    <div className="model-status">
                      <span className={`status-badge ${model.isActive ? 'active' : 'inactive'}`}>
                        {model.isActive ? '启用' : '禁用'}
                      </span>
                      <span className="priority-badge">优先级 {model.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 未使用的模型区域 */}
        <div className="models-section unused-models">
          <div className="section-header">
            <h3>可添加的模型</h3>
            <span className="count">({unusedModels.length}个)</span>
          </div>
          
          {unusedModels.length === 0 ? (
            <div className="empty-state">
              <p>所有基础模型都已添加到使用区</p>
            </div>
          ) : (
            <div className="models-grid">
              {unusedModels.map((baseModel) => (
                                 <div 
                   key={baseModel.name} 
                   className="model-card unused" 
                   onClick={() => handleAddToUsed(baseModel.name)}
                   title={`点击添加 ${baseModel.name}`}
                 >
                   <div className="model-icon">
                     <ColorfulModelIcon model={baseModel.icon} size={20} />
                   </div>
                   <div className="model-name">{baseModel.name}</div>
                 </div>
              ))}
            </div>
          )}
        </div>




      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import logo from "../logo.png";

// ─── TAKE OFF Design System ───
// Orange: #FC4814 (primary accent, CTAs)
// Background: #F4F4F4
// Ink: #111111 (main text)
// Text Secondary: #555555
// Border: #E0E0E0
// Font: Inter
// Border Radius: 4px, 8px, 12px, 24px
// Spacing: 4, 8, 16, 24, 48

const STORAGE_KEY = "takeoff_crm_data";

const NICHES = [
  "Dentista", "Nutricionista", "Personal Trainer", "Fisioterapeuta",
  "Advogado", "Arquiteto", "Psicólogo", "Médico", "Contador",
  "Fotógrafo", "Esteticista", "Veterinário", "Coach", "Consultor",
  "Barbeiro/Cabeleireiro", "Tatuador", "Outro"
];

const PIPELINE_STAGES = [
  { id: "prospectado", label: "Prospectado", icon: "🔍", color: "#555555" },
  { id: "contatado", label: "Contatado", icon: "💬", color: "#3B82F6" },
  { id: "respondeu", label: "Respondeu", icon: "✅", color: "#8B5CF6" },
  { id: "reuniao", label: "Reunião", icon: "📅", color: "#F59E0B" },
  { id: "proposta", label: "Proposta", icon: "📄", color: "#EC4899" },
  { id: "fechou", label: "Fechou", icon: "🤝", color: "#16A34A" },
  { id: "perdido", label: "Perdido", icon: "✕", color: "#DC2626" },
];

const QUAL_CRITERIA = [
  { id: "instagram_ativo", label: "Instagram ativo (posta com frequência)", weight: 2 },
  { id: "sem_site", label: "Não tem site ou site ruim", weight: 3 },
  { id: "audiencia", label: "Tem audiência mínima (500+ seguidores)", weight: 1 },
  { id: "profissional", label: "Perfil profissional (não pessoal)", weight: 2 },
  { id: "localizacao", label: "Atende região acessível", weight: 1 },
  { id: "capacidade_pgto", label: "Aparenta capacidade de pagamento", weight: 2 },
  { id: "engajamento", label: "Tem engajamento nos posts", weight: 1 },
];

const MAX_SCORE = QUAL_CRITERIA.reduce((s, c) => s + c.weight, 0);

const SCRIPTS = {
  primeiro_contato: {
    title: "1º Contato",
    subtitle: "DM Fria — gerar curiosidade, não vender",
    templates: [
      {
        name: "Elogio + Observação",
        text: `Oi [NOME]! Tudo bem? 👋\n\nTava vendo teu trabalho aqui no Instagram e curti muito [DETALHE ESPECÍFICO DO PERFIL].\n\nNotei que tu não tem um site ainda — e achei curioso porque teu conteúdo aqui é muito bom. Já pensou em ter uma presença digital mais completa?\n\nPergunto porque trabalho exatamente com isso — ajudo profissionais como tu a terem um site profissional em 7 dias que converte visitante em cliente.\n\nSe tiver interesse, posso te mostrar como funciona. Sem compromisso! 😊`
      },
      {
        name: "Direto ao Problema",
        text: `Oi [NOME]! 👋\n\nVi que tu é [PROFISSÃO] aqui em [CIDADE] e teu Instagram tá muito bem feito.\n\nMas te faço uma pergunta: quando alguém pesquisa "[PROFISSÃO] em [CIDADE]" no Google, te encontra?\n\nA maioria dos profissionais que conheço perde clientes todo mês por não ter um site que aparece no Google e passa credibilidade profissional.\n\nTrabalho com um sistema que resolve isso em 7 dias. Posso te explicar rapidinho?`
      },
      {
        name: "Social Proof",
        text: `Oi [NOME]! Tudo bem? 😊\n\nAcabei de entregar o site de um(a) [PROFISSÃO SIMILAR] aqui da região e ele(a) ficou impressionado(a) com o resultado.\n\nVi teu perfil e pensei que tu também poderia se beneficiar de uma presença digital mais forte fora do Instagram.\n\nPosso te mandar um exemplo rápido do tipo de resultado que entrego?`
      }
    ]
  },
  followup: {
    title: "Follow-up",
    subtitle: "3-5 dias sem resposta — leve e sem pressão",
    templates: [
      {
        name: "Bump Suave",
        text: `Oi [NOME]! Sei que a rotina é corrida 😅\n\nSó passando pra ver se tu viu minha mensagem anterior. Sem pressão nenhuma!\n\nSe tiver interesse em saber como funciona, é só me responder aqui. Se não for o momento, tranquilo também! 👊`
      },
      {
        name: "Conteúdo de Valor",
        text: `Oi [NOME]!\n\nCriei um material rápido sobre [3 erros que profissionais cometem na presença digital / como aparecer no Google / etc.] — achei que podia te interessar.\n\nQuer que eu te mande?`
      }
    ]
  },
  objecoes: {
    title: "Objeções",
    subtitle: "Rebatidas para objeções clássicas",
    templates: [
      {
        name: "\"Tá caro\"",
        text: `Entendo! E é importante que o investimento faça sentido pra ti.\n\nSó pra ter uma ideia: quantos clientes novos por mês pagam o site? Geralmente 1-2 clientes já cobrem o investimento total.\n\nE diferente de anúncio, o site não para de funcionar — ele trabalha pra ti 24h, todo dia.\n\nO que tu acha de a gente ver os números juntos?`
      },
      {
        name: "\"Não preciso de site\"",
        text: `Faz sentido, o Instagram funciona bem mesmo!\n\nMas te pergunto: e quando o Instagram cai? (tipo aquele apagão de horas)... E quando alguém pesquisa teu nome no Google antes de agendar?\n\nO site não substitui o Instagram — ele complementa. É tipo um cartão de visitas que nunca fecha.\n\n80% dos clientes pesquisam no Google antes de decidir. Tu aparece lá?`
      },
      {
        name: "\"Depois eu vejo\"",
        text: `Tranquilo! Sem pressa mesmo.\n\nSó uma coisa pra considerar: cada semana sem site são potenciais clientes que pesquisam, não te encontram, e vão pro concorrente que tem.\n\nMas fica à vontade! Se quiser retomar depois, tô por aqui. 👊`
      },
      {
        name: "\"Já tentei e não deu certo\"",
        text: `Puxa, imagino a frustração. Infelizmente muita gente vende site que é só "bonito" mas não converte.\n\nO que eu faço é diferente: não entrego só design — entrego um sistema de conversão alinhado ao TEU negócio. Copy, visual e CTA — tudo pensado pra transformar visitante em cliente.\n\nPosso te mostrar um caso real de como funciona?`
      }
    ]
  }
};

const getQualScore = (qual) => QUAL_CRITERIA.reduce((sum, c) => sum + (qual?.[c.id] ? c.weight : 0), 0);

const getScoreLabel = (score) => {
  const pct = score / MAX_SCORE;
  if (pct >= 0.75) return { text: "Quente", emoji: "🔥", color: "#DC2626" };
  if (pct >= 0.5) return { text: "Morno", emoji: "☀️", color: "#F59E0B" };
  if (pct >= 0.25) return { text: "Frio", emoji: "❄️", color: "#3B82F6" };
  return { text: "Gelado", emoji: "🧊", color: "#94A3B8" };
};

const formatDate = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
const formatDateTime = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function ProspeccaoTakeOff() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.leads) return parsed;
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    }
    return { leads: [] };
  });
  const [activeTab, setActiveTab] = useState("pipeline");
  const [showAddLead, setShowAddLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedScript, setSelectedScript] = useState("primeiro_contato");
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [draggedLead, setDraggedLead] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const emptyLead = { nome: "", instagram: "", nicho: "Dentista", cidade: "Caxias do Sul", notas: "", qualificacao: {}, valor: 1497 };
  const [newLead, setNewLead] = useState({ ...emptyLead });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.error("Erro ao salvar:", e); }
  }, [data]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const stats = (() => {
    const { leads } = data;
    const fechados = leads.filter(l => l.stage === "fechou");
    const perdidos = leads.filter(l => l.stage === "perdido");
    const fin = fechados.length + perdidos.length;
    return {
      total: leads.length, fechados: fechados.length,
      conversao: fin > 0 ? Math.round((fechados.length / fin) * 100) : 0,
      receita: fechados.reduce((s, l) => s + (l.valor || 0), 0),
      ativos: leads.filter(l => !["fechou", "perdido"].includes(l.stage)).length
    };
  })();

  const addLead = () => {
    if (!newLead.nome.trim()) return;
    const lead = { ...newLead, instagram: newLead.instagram.replace("@", ""), id: Date.now().toString(), stage: "prospectado", score: getQualScore(newLead.qualificacao), createdAt: new Date().toISOString(), history: [{ date: new Date().toISOString(), action: "Lead criado" }] };
    setData(p => ({ ...p, leads: [...p.leads, lead] }));
    setNewLead({ ...emptyLead }); setShowAddLead(false);
    showToast(`${lead.nome} adicionado ao pipeline`);
  };

  const moveLead = (leadId, newStage) => {
    setData(p => ({ ...p, leads: p.leads.map(l => l.id === leadId ? { ...l, stage: newStage, history: [...l.history, { date: new Date().toISOString(), action: `→ ${PIPELINE_STAGES.find(s => s.id === newStage)?.label}` }] } : l) }));
    showToast(`Movido para ${PIPELINE_STAGES.find(s => s.id === newStage)?.label}`);
  };

  const updateLeadNotes = (leadId, notas) => { setData(p => ({ ...p, leads: p.leads.map(l => l.id === leadId ? { ...l, notas } : l) })); };
  const deleteLead = (leadId) => { setData(p => ({ ...p, leads: p.leads.filter(l => l.id !== leadId) })); setSelectedLead(null); setConfirmDelete(null); showToast("Lead removido"); };
  const copyScript = (text, id) => { navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }); };

  const filteredLeads = data.leads.filter(l => {
    const s = searchTerm.toLowerCase();
    return (!s || l.nome.toLowerCase().includes(s) || l.instagram.toLowerCase().includes(s) || l.nicho.toLowerCase().includes(s)) && (filterStage === "all" || l.stage === filterStage);
  });

  const S = {
    input: { width: "100%", background: "#FFFFFF", border: "1px solid #E0E0E0", borderRadius: "8px", padding: "10px 14px", color: "#111111", fontSize: "14px", fontFamily: "inherit", outline: "none" },
    label: { fontSize: "11px", color: "#555555", letterSpacing: "0.5px", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase" },
    btnPrimary: { background: "#FC4814", border: "none", color: "#FFFFFF", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "inherit" },
    btnSecondary: { background: "#F4F4F4", border: "1px solid #E0E0E0", color: "#111111", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500, fontFamily: "inherit" },
    card: { background: "#FFFFFF", border: "1px solid #E0E0E0", borderRadius: "8px" },
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#F4F4F4", color: "#111", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #F4F4F4; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 4px; }
        input, textarea, select { font-family: 'Inter', sans-serif; }
        input:focus, textarea:focus, select:focus { border-color: #FC4814 !important; outline: none; }
        @keyframes slideDown { from { opacity:0; transform: translateY(-12px); } to { opacity:1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .hlift { transition: all 0.15s ease; } .hlift:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .hbg:hover { background: #FAFAFA !important; }
      `}</style>

      {toast && <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, zIndex: 9999, animation: "toastIn 0.3s ease", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* HEADER */}
      <div style={{ background: "#FFF", borderBottom: "1px solid #E0E0E0", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src={logo} alt="Take Off" style={{ height: "99px", objectFit: "contain" }} />
            <div style={{ width: "1px", height: "32px", background: "#E0E0E0" }} />
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>Prospecção</div>
              <div style={{ fontSize: "11px", color: "#555" }}>Sistema de prospecção ativa — Instagram DM</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[ { l: "Leads", v: stats.total, c: "#111" }, { l: "Ativos", v: stats.ativos, c: "#3B82F6" }, { l: "Fechados", v: stats.fechados, c: "#16A34A" }, { l: "Conversão", v: `${stats.conversao}%`, c: "#F59E0B" }, { l: "Receita", v: `R$ ${stats.receita.toLocaleString("pt-BR")}`, c: "#FC4814" } ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{s.l}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px", marginTop: "20px", maxWidth: "1200px", margin: "20px auto 0" }}>
          {["pipeline", "leads", "scripts", "radar"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", borderRadius: "8px 8px 0 0", background: activeTab === t ? "#F4F4F4" : "transparent", color: activeTab === t ? "#FC4814" : "#555", borderBottom: activeTab === t ? "2px solid #FC4814" : "2px solid transparent" }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* PIPELINE */}
        {activeTab === "pipeline" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px" }}>Funil de Vendas</h2>
              <button onClick={() => { setShowAddLead(true); setActiveTab("leads"); }} style={S.btnPrimary}>+ Novo Lead</button>
            </div>
            {data.leads.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", padding: "64px 24px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
                <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Pipeline vazio</p>
                <p style={{ fontSize: "13px", color: "#555", marginBottom: "20px" }}>Comece adicionando leads ou veja o Radar para aprender a encontrá-los</p>
                <button onClick={() => setActiveTab("radar")} style={S.btnSecondary}>Ver Radar →</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {PIPELINE_STAGES.map(stage => {
                  const sl = data.leads.filter(l => l.stage === stage.id);
                  return (
                    <div key={stage.id} onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = "#FFF5F2"; }} onDragLeave={e => { e.currentTarget.style.background = "#FFF"; }} onDrop={e => { e.preventDefault(); e.currentTarget.style.background = "#FFF"; if (draggedLead) { moveLead(draggedLead, stage.id); setDraggedLead(null); } }} style={{ ...S.card, minWidth: "170px", flex: 1, padding: "12px", transition: "background 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "8px", borderBottom: `2px solid ${stage.color}` }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: stage.color }}>{stage.label}</span>
                        <span style={{ background: `${stage.color}15`, color: stage.color, fontSize: "11px", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>{sl.length}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "60px" }}>
                        {sl.map(lead => { const si = getScoreLabel(lead.score); return (
                          <div key={lead.id} draggable onDragStart={() => setDraggedLead(lead.id)} onClick={() => setSelectedLead(lead)} className="hlift" style={{ background: "#FAFAFA", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "10px 12px", cursor: "grab", borderLeft: `3px solid ${si.color}` }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#111", marginBottom: "2px" }}>{lead.nome}</div>
                            <div style={{ fontSize: "11px", color: "#555" }}>@{lead.instagram}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                              <span style={{ fontSize: "10px", color: si.color, fontWeight: 600 }}>{si.emoji} {si.text}</span>
                              <span style={{ fontSize: "10px", color: "#555" }}>R$ {(lead.valor || 0).toLocaleString("pt-BR")}</span>
                            </div>
                          </div>
                        ); })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LEADS */}
        {activeTab === "leads" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px" }}>Leads</h2>
              <button onClick={() => setShowAddLead(!showAddLead)} style={{ ...S.btnPrimary, background: showAddLead ? "#555" : "#FC4814" }}>{showAddLead ? "✕ Cancelar" : "+ Novo Lead"}</button>
            </div>

            {showAddLead && (
              <div style={{ ...S.card, padding: "24px", marginBottom: "20px", animation: "slideDown 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <div style={{ width: "4px", height: "20px", background: "#FC4814", borderRadius: "2px" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Novo Lead + Qualificação</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  {[{ k: "nome", l: "Nome", p: "Nome do profissional" }, { k: "instagram", l: "Instagram", p: "usuario (sem @)" }, { k: "cidade", l: "Cidade", p: "Cidade" }].map(f => (
                    <div key={f.k}><label style={S.label}>{f.l}</label><input value={newLead[f.k]} onChange={e => setNewLead({ ...newLead, [f.k]: e.target.value })} placeholder={f.p} style={S.input} /></div>
                  ))}
                  <div><label style={S.label}>Nicho</label><select value={newLead.nicho} onChange={e => setNewLead({ ...newLead, nicho: e.target.value })} style={{ ...S.input, cursor: "pointer" }}>{NICHES.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={S.label}>Valor do Projeto (R$)</label>
                  <input type="number" value={newLead.valor} onChange={e => setNewLead({ ...newLead, valor: Number(e.target.value) })} style={{ ...S.input, width: "200px", fontSize: "16px", fontWeight: 700, color: "#FC4814" }} />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <label style={{ ...S.label, marginBottom: 0 }}>Qualificação</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>{getQualScore(newLead.qualificacao)}/{MAX_SCORE} pts</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 10px", borderRadius: "12px", color: getScoreLabel(getQualScore(newLead.qualificacao)).color, background: `${getScoreLabel(getQualScore(newLead.qualificacao)).color}15` }}>{getScoreLabel(getQualScore(newLead.qualificacao)).emoji} {getScoreLabel(getQualScore(newLead.qualificacao)).text}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {QUAL_CRITERIA.map(c => { const ck = !!newLead.qualificacao[c.id]; return (
                      <label key={c.id} className="hbg" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: ck ? "#FFF5F2" : "#FFF", border: `1px solid ${ck ? "#FC481440" : "#E0E0E0"}`, cursor: "pointer", transition: "all 0.15s" }}>
                        <input type="checkbox" checked={ck} onChange={() => setNewLead({ ...newLead, qualificacao: { ...newLead.qualificacao, [c.id]: !ck } })} style={{ accentColor: "#FC4814", width: "16px", height: "16px" }} />
                        <span style={{ fontSize: "13px", color: ck ? "#111" : "#555", flex: 1, fontWeight: ck ? 500 : 400 }}>{c.label}</span>
                        <span style={{ fontSize: "11px", color: "#999", fontWeight: 600 }}>+{c.weight}</span>
                      </label>
                    ); })}
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={S.label}>Notas</label>
                  <textarea value={newLead.notas} onChange={e => setNewLead({ ...newLead, notas: e.target.value })} placeholder="Observações sobre o lead..." rows={3} style={{ ...S.input, resize: "vertical" }} />
                </div>
                <button onClick={addLead} disabled={!newLead.nome.trim()} style={{ ...S.btnPrimary, width: "100%", padding: "12px", opacity: newLead.nome.trim() ? 1 : 0.5, cursor: newLead.nome.trim() ? "pointer" : "not-allowed" }}>Adicionar ao Pipeline →</button>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nome, @ ou nicho..." style={{ ...S.input, flex: 1, minWidth: "200px" }} />
              <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ ...S.input, width: "auto", minWidth: "160px", cursor: "pointer" }}>
                <option value="all">Todos os estágios</option>
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
              </select>
            </div>

            {filteredLeads.length === 0 && !showAddLead ? (
              <div style={{ ...S.card, textAlign: "center", padding: "48px 24px" }}><p style={{ color: "#555", fontSize: "14px" }}>{data.leads.length === 0 ? "Nenhum lead cadastrado." : "Nenhum resultado."}</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredLeads.map(lead => { const si = getScoreLabel(lead.score); const st = PIPELINE_STAGES.find(s => s.id === lead.stage); return (
                  <div key={lead.id} className="hlift hbg" onClick={() => setSelectedLead(lead)} style={{ ...S.card, padding: "16px 20px", cursor: "pointer", borderLeft: `4px solid ${st.color}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>{lead.nome}</div>
                      <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>@{lead.instagram} · {lead.nicho} · {lead.cidade}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#FC4814" }}>R$ {(lead.valor || 0).toLocaleString("pt-BR")}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "12px", color: st.color, background: `${st.color}12` }}>{st.label}</span>
                      <span style={{ fontSize: "11px", color: si.color, fontWeight: 600 }}>{si.emoji}</span>
                    </div>
                  </div>
                ); })}
              </div>
            )}
          </div>
        )}

        {/* SCRIPTS */}
        {activeTab === "scripts" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "4px" }}>Scripts de Abordagem</h2>
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "20px" }}>Instagram DM — copie, personalize os campos <span style={{ color: "#FC4814", fontWeight: 600 }}>[ENTRE COLCHETES]</span> e envie</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {Object.entries(SCRIPTS).map(([key, val]) => (
                <button key={key} onClick={() => setSelectedScript(key)} style={{ ...S.card, padding: "12px 16px", cursor: "pointer", borderColor: selectedScript === key ? "#FC4814" : "#E0E0E0", background: selectedScript === key ? "#FFF5F2" : "#FFF", flex: 1, textAlign: "left", fontFamily: "inherit", border: "1px solid" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: selectedScript === key ? "#FC4814" : "#111" }}>{val.title}</div>
                  <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{val.subtitle}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {SCRIPTS[selectedScript].templates.map((tmpl, i) => (
                <div key={i} style={{ ...S.card, padding: "20px", animation: "slideDown 0.3s", animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "3px", height: "16px", background: "#FC4814", borderRadius: "2px" }} />
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{tmpl.name}</span>
                    </div>
                    <button onClick={() => copyScript(tmpl.text, `${selectedScript}-${i}`)} style={{ ...S.btnSecondary, fontSize: "12px", padding: "6px 14px", background: copiedId === `${selectedScript}-${i}` ? "#16A34A" : undefined, color: copiedId === `${selectedScript}-${i}` ? "#fff" : undefined, borderColor: copiedId === `${selectedScript}-${i}` ? "#16A34A" : undefined }}>{copiedId === `${selectedScript}-${i}` ? "✓ Copiado!" : "Copiar"}</button>
                  </div>
                  <pre style={{ fontSize: "13px", color: "#333", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#FAFAFA", borderRadius: "8px", padding: "16px", border: "1px solid #E8E8E8", fontFamily: "'Inter', sans-serif" }}>{tmpl.text}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RADAR */}
        {activeTab === "radar" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "4px" }}>Radar de Leads</h2>
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "24px" }}>Método sistemático para encontrar leads qualificados no Instagram</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { s: "01", t: "Busca por Hashtag Local", icon: "#️⃣", c: "Pesquise hashtags como #dentistacaxiasdosul, #nutricionistacaxias, #personaltrainercaxias. Abra os perfis que aparecem, verifique se têm site no bio. Se NÃO tem → lead potencial.", tip: "Foque em posts recentes (último mês) — perfis ativos são mais propensos a investir." },
                { s: "02", t: "Busca por Localização", icon: "📍", c: "No Instagram, busque pelo local (ex: \"Caxias do Sul\"). Filtre por posts de profissionais (consultórios, estúdios, clínicas). Clique no perfil → sem site no bio? → Lead.", tip: "Funciona especialmente bem pra profissionais que postam do local de trabalho." },
                { s: "03", t: "Seguidores de Concorrentes", icon: "🔗", c: "Ache outros web designers ou agências da região. Veja quem segue eles — muitos são profissionais buscando serviço. Filtre os que não têm site → Lead.", tip: "Seguidores de concorrentes já demonstraram interesse em presença digital." },
                { s: "04", t: "Google Maps — Mina de Ouro", icon: "🗺️", c: "Abra o Google Maps → pesquise \"[profissão] em [cidade]\". Veja os resultados → clique no site. Se NÃO tem site, ou o site é ruim/desatualizado → Lead qualificadíssimo.", tip: "Profissionais no Google Maps sem site estão literalmente pedindo pra você abordá-los." },
                { s: "05", t: "Rotina Diária — 15 min/dia", icon: "⏱️", c: "Meta: 5 novos leads/dia = 25/semana = 100/mês.\n\n• 5 min — Hashtags locais (2 leads)\n• 5 min — Google Maps (2 leads)\n• 5 min — Localização/Seguidores (1 lead)\n\nCadastre cada lead na aba Leads com qualificação preenchida.", tip: "Consistência > volume. 15 minutos todo dia fecha mais que 3 horas num sábado." }
              ].map((item, i) => (
                <div key={i} style={{ ...S.card, padding: "20px", animation: "slideDown 0.3s", animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#FFF5F2", color: "#FC4814", fontSize: "14px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.s}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>{item.icon} {item.t}</h3>
                      <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: "12px" }}>{item.c}</p>
                      <div style={{ background: "#FFF5F2", borderRadius: "8px", padding: "10px 14px", borderLeft: "3px solid #FC4814" }}>
                        <span style={{ fontSize: "12px", color: "#FC4814", fontWeight: 500 }}>💡 {item.tip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LEAD DETAIL MODAL */}
      {selectedLead && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", animation: "fadeIn 0.2s", backdropFilter: "blur(4px)" }} onClick={() => { setSelectedLead(null); setConfirmDelete(null); }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#FFF", borderRadius: "12px", padding: "28px", width: "100%", maxWidth: "520px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 700 }}>{selectedLead.nome}</h3>
                <p style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>@{selectedLead.instagram} · {selectedLead.nicho} · {selectedLead.cidade}</p>
              </div>
              <button onClick={() => { setSelectedLead(null); setConfirmDelete(null); }} style={{ background: "#F4F4F4", border: "none", color: "#555", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "12px", color: getScoreLabel(selectedLead.score).color, background: `${getScoreLabel(selectedLead.score).color}12` }}>{getScoreLabel(selectedLead.score).emoji} {getScoreLabel(selectedLead.score).text} — {selectedLead.score}pts</span>
              <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "12px", color: "#FC4814", background: "#FFF5F2" }}>R$ {(selectedLead.valor || 0).toLocaleString("pt-BR")}</span>
              <span style={{ fontSize: "11px", color: "#999", padding: "4px 0", alignSelf: "center" }}>Criado em {formatDate(selectedLead.createdAt)}</span>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={S.label}>Mover para</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {PIPELINE_STAGES.map(s => { const act = selectedLead.stage === s.id; return (
                  <button key={s.id} onClick={() => { moveLead(selectedLead.id, s.id); setSelectedLead({ ...selectedLead, stage: s.id, history: [...selectedLead.history, { date: new Date().toISOString(), action: `→ ${s.label}` }] }); }} style={{ background: act ? `${s.color}15` : "#F4F4F4", border: `1.5px solid ${act ? s.color : "#E0E0E0"}`, color: act ? s.color : "#555", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: act ? 700 : 500, fontFamily: "inherit" }}>{s.icon} {s.label}</button>
                ); })}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={S.label}>Notas</label>
              <textarea value={data.leads.find(l => l.id === selectedLead.id)?.notas || ""} onChange={e => { updateLeadNotes(selectedLead.id, e.target.value); setSelectedLead({ ...selectedLead, notas: e.target.value }); }} placeholder="Adicione observações..." rows={3} style={{ ...S.input, resize: "vertical" }} />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={S.label}>Histórico</label>
              <div style={{ background: "#FAFAFA", borderRadius: "8px", border: "1px solid #E8E8E8", overflow: "hidden" }}>
                {selectedLead.history.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 14px", borderBottom: i < selectedLead.history.length - 1 ? "1px solid #E8E8E8" : "none" }}>
                    <span style={{ fontSize: "11px", color: "#999", minWidth: "85px", fontWeight: 500 }}>{formatDateTime(h.date)}</span>
                    <span style={{ fontSize: "13px", color: "#333" }}>{h.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(selectedLead.id)} style={{ background: "none", border: "1px solid #E0E0E0", color: "#DC2626", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "inherit", fontWeight: 500 }}>Remover lead</button>
            ) : (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "12px 16px", background: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA" }}>
                <span style={{ fontSize: "13px", color: "#DC2626", flex: 1 }}>Tem certeza?</span>
                <button onClick={() => deleteLead(selectedLead.id)} style={{ background: "#DC2626", border: "none", color: "#fff", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "inherit" }}>Sim, remover</button>
                <button onClick={() => setConfirmDelete(null)} style={{ ...S.btnSecondary, padding: "6px 14px", fontSize: "12px" }}>Cancelar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
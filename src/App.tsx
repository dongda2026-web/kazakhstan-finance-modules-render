import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Banknote,
  BrainCircuit,
  Building2,
  ChartCandlestick,
  CircleDollarSign,
  Database,
  Landmark,
  Newspaper,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { banks, fxSeries, policyCards, sectorMix, sourceLinks, stockIndexSeries, stocks } from "./data";

type ModuleKey = "bank" | "fx" | "stock" | "news" | "ai" | "policy";
type NewsItem = { id: string; title: string; summary: string; link: string; ts: number; source: string; lang: "zh" | "en" | "ru"; cat: string; sub?: string[] | null };
type FxApiResponse = { updated?: number; rates?: Record<string, number | null>; error?: string };
type CaAnalysisResponse = { stat: { 汇率: number; 利率: number; 贸易: number; 其他: number; total: number }; sources: string[] };

const pieColors = ["#0a84ff", "#30d158", "#ff9f0a", "#64d2ff", "#8e8e93"];
const riskClass = { 低: "riskLow", 中: "riskMid", 偏高: "riskHigh" } as const;
const shortBankName: Record<string, string> = { "Halyk Bank": "Halyk", "Kaspi Bank": "Kaspi", ForteBank: "Forte", "Jusan Bank": "Jusan", "Bank CenterCredit": "BCC", "Freedom Bank": "Freedom" };

const fallbackNews: NewsItem[] = [
  { id: "fallback-kz-rate", title: "哈萨克斯坦金融市场关注坚戈汇率与央行政策信号", summary: "市场继续跟踪 KZT 对美元和卢布的波动，银行存款利率、贸易结算成本和股票估值都受到汇率预期影响。", link: "", ts: Date.now(), source: "内置快讯", lang: "zh", cat: "中亚", sub: ["汇率", "利率"] },
  { id: "fallback-trade", title: "中亚贸易企业关注结算周期和进口成本变化", summary: "人民币、美元、坚戈和卢布之间的交叉汇率会影响采购报价、账期安排和库存策略，建议按币种拆分报价风险。", link: "", ts: Date.now() - 3600_000, source: "内置快讯", lang: "zh", cat: "中亚", sub: ["贸易", "汇率"] },
  { id: "fallback-stock", title: "KASE 与 AIX 代表性股票仍以银行、资源、电信和公用事业为核心观察对象", summary: "高分红资产适合和存款收益比较，成长型金融科技资产则需要结合估值、流动性和汇率风险一起评估。", link: "", ts: Date.now() - 7200_000, source: "内置快讯", lang: "zh", cat: "金融", sub: ["贸易"] },
];
const fallbackFx: FxApiResponse = { updated: Date.now(), rates: { "USD/KZT": 471.77, "CNY/KZT": 65.15, "USD/RUB": 89.4, "CNY/RUB": 12.35, "USD/CNY": 7.24, "EUR/KZT": 539.3, "USD/EUR": 0.87 } };
const fallbackAnalysis: CaAnalysisResponse = { stat: { 汇率: 14, 利率: 5, 贸易: 9, 其他: 3, total: 31 }, sources: ["内置快讯"] };

const modules: Array<{ key: ModuleKey; title: string; description: string; metric: string; icon: typeof Banknote; tone: string }> = [
  { key: "bank", title: "银行模块", description: "各大银行存款、汇率入口、利率比较和风险标签。", metric: `${banks.length} 家银行`, icon: Banknote, tone: "blue" },
  { key: "fx", title: "汇率模块", description: "USD/KZT、EUR/KZT、RUB/KZT 趋势和结算影响。", metric: "3 条曲线", icon: CircleDollarSign, tone: "green" },
  { key: "stock", title: "股票模块", description: "KASE/AIX 股票、指数、行业暴露和估值分析。", metric: `${stocks.length} 只股票`, icon: ChartCandlestick, tone: "orange" },
  { key: "news", title: "快讯模块", description: "环球财经、中亚新闻、中文摘录、汇率和 AI 简报。", metric: "RSS + AI", icon: Newspaper, tone: "blue" },
  { key: "ai", title: "AI 模块", description: "行情拆解、因子评分、深度分析和本地记忆库。", metric: "5 因子", icon: BrainCircuit, tone: "dark" },
  { key: "policy", title: "政策模块", description: "央行机制、存款保障、官方来源和政策链接。", metric: `${policyCards.length} 条政策`, icon: ShieldCheck, tone: "green" },
];

function AppHeader() {
  return <header className="appHeader"><div className="brandBlock"><div className="brandIcon"><Landmark size={22} /></div><div><h1>哈萨克斯坦金融看板</h1><p>银行存款、汇率、政策、股票与市场分析</p></div></div><div className="headerTools"><div className="searchBox"><Search size={16} /><span>搜索银行、股票、政策</span></div><button className="iconButton" aria-label="筛选"><SlidersHorizontal size={18} /></button></div></header>;
}

function SegmentControl({ onOpen }: { onOpen: (m: ModuleKey | null) => void }) {
  const items: Array<[string, ModuleKey | null]> = [["总览", null], ["银行", "bank"], ["汇率", "fx"], ["股票", "stock"], ["快讯", "news"], ["AI", "ai"], ["政策", "policy"]];
  return <div className="segmented">{items.map(([label, key], i) => <button key={label} className={i === 0 ? "active" : ""} onClick={() => onOpen(key)}>{label}</button>)}</div>;
}

function MetricCard({ icon: Icon, title, value, delta, tone }: { icon: typeof TrendingUp; title: string; value: string; delta: string; tone: string }) {
  return <section className={`metricCard ${tone}`}><div className="metricTop"><Icon size={19} /><span>{delta}</span></div><p>{title}</p><strong>{value}</strong></section>;
}

function ModuleHub({ onOpen }: { onOpen: (m: ModuleKey) => void }) {
  return <section className="moduleHub"><div className="sectionTitle"><h2>模块总览</h2><p>所有页面已经收拢到这些模块中，点击卡片进入对应二级页面。</p></div><div className="moduleGrid">{modules.map((card) => { const Icon = card.icon; return <button className={`moduleCard ${card.tone}`} type="button" key={card.key} onClick={() => onOpen(card.key)}><div className="moduleIcon"><Icon size={22} /></div><div><strong>{card.title}</strong><p>{card.description}</p></div><span>{card.metric}</span></button>; })}</div></section>;
}

function BankTable() {
  return <section className="panel bankPanel"><div className="panelHeader"><div><h2>主要银行存款与汇率入口</h2><p>利率为示例快照，实际报价以来源链接为准</p></div><button className="softButton">12个月 KZT</button></div><div className="tableWrap"><table><thead><tr><th>银行</th><th>存款产品</th><th>KZT 年化</th><th>USD 年化</th><th>流动性</th><th>风险</th><th>链接</th></tr></thead><tbody>{banks.map((bank) => <tr key={bank.name}><td><div className="entity"><span>{bank.name.slice(0, 1)}</span><div><strong>{bank.name}</strong><small>{bank.brand}</small></div></div></td><td>{bank.deposit}</td><td className="numeric">{bank.rateKzt.toFixed(1)}%</td><td className="numeric">{bank.rateUsd.toFixed(1)}%</td><td>{bank.liquidity}</td><td><span className={`riskPill ${riskClass[bank.risk]}`}>{bank.risk}</span></td><td><a className="linkButton" href={bank.source} target="_blank" rel="noreferrer">查看<ArrowUpRight size={14} /></a></td></tr>)}</tbody></table></div></section>;
}

function FxChart() {
  return <section className="panel chartPanel"><div className="panelHeader"><div><h2>汇率趋势</h2><p>USD/KZT、EUR/KZT、RUB/KZT 月度观察</p></div><span className="liveDot">NBK</span></div><ResponsiveContainer width="100%" height={255}><LineChart data={fxSeries}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7ebf2" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis yAxisId="kzt" tickLine={false} axisLine={false} width={52} domain={["dataMin - 18", "dataMax + 18"]} /><YAxis yAxisId="rub" orientation="right" tickLine={false} axisLine={false} width={34} domain={[4.5, 7]} /><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e5e8ef" }} /><Line yAxisId="kzt" type="monotone" dataKey="USD" stroke="#0a84ff" strokeWidth={3} dot={false} isAnimationActive={false} /><Line yAxisId="kzt" type="monotone" dataKey="EUR" stroke="#30d158" strokeWidth={3} dot={false} isAnimationActive={false} /><Line yAxisId="rub" type="monotone" dataKey="RUB" stroke="#ff9f0a" strokeWidth={3} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></section>;
}

function DepositChart() {
  return <section className="panel"><div className="panelHeader"><div><h2>存款利率比较</h2><p>主要银行 KZT 12个月示例</p></div></div><ResponsiveContainer width="100%" height={230}><BarChart data={banks}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" /><XAxis dataKey="name" tickFormatter={(name) => shortBankName[String(name)] ?? String(name)} tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} width={35} domain={[12, 15]} /><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e5e8ef" }} /><Bar dataKey="rateKzt" radius={[10, 10, 4, 4]} fill="#0a84ff" isAnimationActive={false} /></BarChart></ResponsiveContainer></section>;
}

function PolicyPanel() {
  return <section className="policyGrid">{policyCards.map((card) => <a className="policyCard" href={card.source} target="_blank" rel="noreferrer" key={card.title}><ShieldCheck size={19} /><div><span>{card.title}</span><strong>{card.value}</strong><p>{card.note}</p></div></a>)}</section>;
}

function StockTable() {
  return <section className="panel stockPanel"><div className="panelHeader"><div><h2>哈萨克斯坦股票信息与分析</h2><p>KASE、AIX 与海外 GDR/ADR 入口，价格为示例快照</p></div><button className="softButton">风险/收益</button></div><div className="stockGrid">{stocks.map((stock) => <a href={stock.source} className="stockCard" target="_blank" rel="noreferrer" key={stock.ticker}><div className="stockTop"><div><strong>{stock.ticker}</strong><span>{stock.name}</span></div><em className={stock.change >= 0 ? "up" : "down"}>{stock.change >= 0 ? "+" : ""}{stock.change.toFixed(1)}%</em></div><div className="stockPrice">{stock.currency === "USD" ? "$" : ""}{stock.price.toLocaleString("zh-CN")}<small>{stock.currency}</small></div><div className="stockMeta"><span>{stock.venue}</span><span>{stock.sector}</span></div><div className="miniStats"><span>股息 {stock.dividend}%</span><span>PE {stock.pe}</span><span>{stock.view}</span><span className={riskClass[stock.risk]}>{stock.risk}</span></div></a>)}</div></section>;
}

function MarketCharts() {
  return <section className="marketCharts"><div className="panel"><div className="panelHeader"><div><h2>市场指数</h2><p>KASE 与 AIXQI 示例趋势</p></div></div><ResponsiveContainer width="100%" height={230}><AreaChart data={stockIndexSeries}><defs><linearGradient id="kaseFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#0a84ff" stopOpacity={0.28} /><stop offset="95%" stopColor="#0a84ff" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis yAxisId="kase" tickLine={false} axisLine={false} width={48} /><YAxis yAxisId="aix" orientation="right" tickLine={false} axisLine={false} width={42} /><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e5e8ef" }} /><Area yAxisId="kase" type="monotone" dataKey="KASE" stroke="#0a84ff" strokeWidth={3} fill="url(#kaseFill)" isAnimationActive={false} /><Line yAxisId="aix" type="monotone" dataKey="AIXQI" stroke="#30d158" strokeWidth={2} dot={false} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div><div className="panel"><div className="panelHeader"><div><h2>行业暴露</h2><p>关注银行、资源与基础设施权重</p></div></div><ResponsiveContainer width="100%" height={230}><PieChart><Pie data={sectorMix} dataKey="value" innerRadius={56} outerRadius={88} paddingAngle={4} isAnimationActive={false}>{sectorMix.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e5e8ef" }} /></PieChart></ResponsiveContainer><div className="legend">{sectorMix.map((item, index) => <span key={item.name}><i style={{ background: pieColors[index] }} />{item.name} {item.value}%</span>)}</div></div></section>;
}

function AnalysisPanel() {
  return <section className="analysisBand"><div className="analysisTitle"><ChartCandlestick size={24} /><div><h2>股票分析框架</h2><p>把宏观、汇率、分红和流动性放在同一个屏幕里比较。</p></div></div><div className="analysisItems"><div><strong>收益来源</strong><p>本地高分红银行、电信和公用事业提供现金流；Kaspi 偏成长；Kazatomprom 受铀价周期影响。</p></div><div><strong>主要风险</strong><p>KZT 汇率、基准利率、流动性折价、地缘风险、商品价格和监管变化会显著影响估值。</p></div><div><strong>实操建议</strong><p>优先看 KASE/AIX 官方公告和公司 IR，再比较本地股、GDR/ADR 的成交量与税费。</p></div></div></section>;
}

function GlobalNewsPanel() {
  const [scope, setScope] = useState<"global" | "ca">("ca");
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [fx, setFx] = useState<FxApiResponse>(fallbackFx);
  const [analysis, setAnalysis] = useState<CaAnalysisResponse>(fallbackAnalysis);
  const [brief, setBrief] = useState("");
  const [loadingBrief, setLoadingBrief] = useState(false);
  useEffect(() => { const params = new URLSearchParams(scope === "ca" ? { cat: "中亚" } : { cat: "all", lang: "all" }); fetch(`/api/news?${params}`).then((r) => r.ok ? r.json() : { items: fallbackNews }).then((d) => setNews((d.items || fallbackNews).slice(0, 12))).catch(() => setNews(fallbackNews)); if (scope === "ca") { fetch("/api/fx").then((r) => r.ok ? r.json() : fallbackFx).then(setFx).catch(() => setFx(fallbackFx)); fetch("/api/ca-analysis").then((r) => r.ok ? r.json() : fallbackAnalysis).then(setAnalysis).catch(() => setAnalysis(fallbackAnalysis)); } }, [scope]);
  const generateBrief = async () => { setLoadingBrief(true); try { const r = await fetch("/api/brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope }) }); const d = await r.json(); setBrief(d.brief || d.error || "简报生成失败"); } catch { setBrief("简报生成失败，请确认后端服务已启动。"); } finally { setLoadingBrief(false); } };
  return <section className="newsWorkspace"><div className="panel newsControlPanel"><div className="panelHeader"><div className="analysisTitle"><Newspaper size={24} /><div><h2>环球财经快讯</h2><p>RSS 新闻、汇率接口、中亚热点统计和 AI 简报。</p></div></div><button className="softButton" onClick={() => location.reload()}><RefreshCw size={15} />刷新</button></div><div className="newsTabs"><button className={scope === "ca" ? "active" : ""} onClick={() => setScope("ca")}>中亚专区</button><button className={scope === "global" ? "active" : ""} onClick={() => setScope("global")}>全球财经</button></div><div className="briefBox"><div><Sparkles size={18} /><strong>{scope === "ca" ? "中亚贸易·汇率简报" : "今日全球财经简报"}</strong></div>{brief ? <p>{brief}</p> : <span>点击生成后端 AI 简报；未配置 ANTHROPIC_API_KEY 时会显示配置提示。</span>}<button className="primaryButton" onClick={generateBrief} disabled={loadingBrief}><Sparkles size={16} />{loadingBrief ? "生成中" : "生成简报"}</button></div></div><div className="newsSideStack"><div className="panel"><div className="panelHeader"><div><h2>实时汇率</h2><p>来自 `/api/fx` 免费汇率接口</p></div><Globe2 size={20} /></div><div className="fxApiGrid">{["USD/KZT", "CNY/KZT", "USD/RUB", "CNY/RUB"].map((pair) => <div className="fxApiCard" key={pair}><span>{pair}</span><strong>{fx.rates?.[pair] ? fx.rates[pair]?.toFixed(pair.includes("KZT") ? 2 : 4) : "--"}</strong></div>)}</div></div><div className="panel"><div className="panelHeader"><div><h2>中亚动态分析</h2><p>按贸易、汇率、利率关键词拆解新闻</p></div></div><div className="caStats">{(["贸易", "汇率", "利率"] as const).map((item) => <div key={item}><span>{item}</span><b>{analysis.stat[item]}</b><i style={{ width: `${Math.max(8, (analysis.stat[item] / Math.max(1, analysis.stat.total)) * 100)}%` }} /></div>)}<p>建议结合 KZT/RUB 波动调整报价和结算周期。</p></div></div></div><div className="panel newsListPanel"><div className="panelHeader"><div><h2>{scope === "ca" ? "中亚新闻" : "全球财经新闻"}</h2><p>页面内摘录，点击来源可查看原站。</p></div></div><div className="newsList">{news.map((item) => <article className="newsCard" key={item.id}><div className="newsTags"><span>{item.cat}</span>{(item.sub ?? []).slice(0, 2).map((tag) => <em key={tag}>{tag}</em>)}<small>{item.lang.toUpperCase()}</small></div><strong>{item.title}</strong><p>{item.summary || "暂无摘录。"}</p><div className="newsFoot"><span>{item.source}</span><span>{item.link ? <a href={item.link} target="_blank" rel="noreferrer">来源</a> : "内置"}</span></div></article>)}</div></div></section>;
}

function AiPanel() {
  const avgDeposit = banks.reduce((sum, bank) => sum + bank.rateKzt, 0) / banks.length;
  const avgDividend = stocks.reduce((sum, stock) => sum + stock.dividend, 0) / stocks.length;
  const factors = [
    ["收益因子", 91, `KZT 存款均值 ${avgDeposit.toFixed(1)}%，股票股息均值 ${avgDividend.toFixed(1)}%。`],
    ["估值因子", 59, "样本股票 PE 偏低，但需要考虑市场流动性折价。"],
    ["汇率因子", 51, "KZT 样本期波动会影响外币投资者实际回报。"],
    ["政策因子", 76, "央行机制和存款保障较清晰，但高利率周期会压制风险资产估值。"],
    ["记忆匹配", 90, "默认关注 HSBK、KSPI、KAP 和 Halyk Bank。"],
  ] as const;
  return <section className="aiWorkspace"><div className="aiHero panel"><div className="aiHeroTop"><div className="analysisTitle"><BrainCircuit size={24} /><div><h2>AI 深度页面分析</h2><p>本地可解释分析引擎：拆解行情、存款、汇率、政策与股票因子。</p></div></div><div className="aiScore"><span>综合信号</span><strong>73</strong></div></div><div className="aiSummary"><p>模型倾向先观察 Freedom Bank 的 KZT 存款收益和 HSBK 的股息/估值组合；偏高风险资产应要求更高安全边际。</p></div><div className="factorGrid">{factors.map(([name, score, reason]) => <div className="factorCard" key={name}><div className="factorHead"><strong>{name}</strong><span>{score}</span></div><div className="scoreTrack"><i style={{ width: `${score}%` }} /></div><b>{score}</b><p>{reason}</p></div>)}</div></div><div className="memoryPanel panel"><div className="panelHeader"><div><h2>AI 记忆库</h2><p>保存在当前浏览器，用于下一次打开页面继续分析。</p></div><Database size={20} /></div><textarea defaultValue="偏好：优先高分红、可验证官方链接、控制 KZT 汇率风险。" /><div className="watchlist"><button>HSBK</button><button>KSPI</button><button>KAP</button><button>Halyk Bank</button></div><button className="primaryButton">保存分析快照</button></div></section>;
}

function SourcesPanel() { return <section className="sourcesPanel"><div className="sectionTitle"><h2>官方与银行链接</h2><p>所有动态数据建议以后接入这些来源或授权行情 API。</p></div><div className="sourceGrid">{sourceLinks.map((source) => { const Icon = source.icon; return <a href={source.url} className="sourceCard" target="_blank" rel="noreferrer" key={source.label}><Icon size={22} /><div><strong>{source.label}</strong><span>{source.description}</span></div><ArrowUpRight size={16} /></a>; })}</div></section>; }

function ModuleDetailPage({ module, onClose }: { module: ModuleKey; onClose: () => void }) {
  const config = modules.find((item) => item.key === module)!; const Icon = config.icon;
  return <div className="modulePageOverlay"><div className="modulePage"><div className="modulePageHeader"><div className={`modulePageIcon ${config.tone}`}><Icon size={24} /></div><div><h2>{config.title}</h2><p>{config.description}</p></div><button className="detailClose" onClick={onClose}>关闭</button></div><div className="modulePageBody">{module === "bank" && <><section className="dashboardGrid moduleStack"><BankTable /><DepositChart /></section><PolicyPanel /></>}{module === "fx" && <><FxChart /><section className="analysisBand moduleInset"><div className="analysisTitle"><CircleDollarSign size={24} /><div><h2>汇率结算影响</h2><p>把官方汇率、银行报价和贸易成本放在同一个模块里观察。</p></div></div><div className="analysisItems"><div><strong>KZT 风险</strong><p>坚戈波动会影响外币本金折算、进口报价和存款实际收益。</p></div><div><strong>RUB 传导</strong><p>卢布走势会影响区域贸易心理、跨境结算和部分商品报价。</p></div><div><strong>操作口径</strong><p>实际成交应以银行、KASE 或授权行情源为准。</p></div></div></section></>}{module === "stock" && <><StockTable /><MarketCharts /><AnalysisPanel /></>}{module === "news" && <GlobalNewsPanel />}{module === "ai" && <AiPanel />}{module === "policy" && <><PolicyPanel /><SourcesPanel /></>}</div></div></div>;
}

export function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);
  return <main className="appShell"><div className="phoneStatus"><span>9:41</span><span>5G 100%</span></div><AppHeader /><SegmentControl onOpen={setActiveModule} /><section className="metricsGrid"><MetricCard icon={Banknote} title="KZT 存款收益区间" value="13.4% - 14.7%" delta="12M" tone="blue" /><MetricCard icon={CircleDollarSign} title="USD/KZT 官方观察" value="471.77" delta="NBK" tone="green" /><MetricCard icon={TrendingUp} title="KASE 指数参考" value="7,838" delta="+0.40%" tone="orange" /><MetricCard icon={Building2} title="覆盖机构" value="6 银行 + 6 股票" delta="可扩展" tone="red" /></section><ModuleHub onOpen={setActiveModule} />{activeModule && <ModuleDetailPage module={activeModule} onClose={() => setActiveModule(null)} />}</main>;
}

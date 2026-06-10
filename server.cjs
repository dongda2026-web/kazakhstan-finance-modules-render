// 环球财经快讯后端 v2 - 疆塑·东大贸易
// 大幅扩源 + Claude翻译 + AI简报 + 免费汇率
const express = require('express');
const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const parser = new Parser({
  timeout: 12000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/2.0)' }
});
const cache = new NodeCache({ stdTTL: 600 });
const fxCache = new NodeCache({ stdTTL: 1800 });
const aiCache = new NodeCache({ stdTTL: 1800 }); // 翻译/简报缓存30分钟

const FEEDS = [
  { id:'kursiv', name:'Kursiv 哈萨克财经', lang:'ru', cat:'中亚', url:'https://kz.kursiv.media/feed/' },
  { id:'kapital_kz', name:'Kapital.kz', lang:'ru', cat:'中亚', url:'https://kapital.kz/rss' },
  { id:'inform_kz', name:'Kazinform', lang:'ru', cat:'中亚', url:'https://www.inform.kz/rss' },
  { id:'tengrinews', name:'Tengrinews', lang:'ru', cat:'中亚', url:'https://tengrinews.kz/rss/' },
  { id:'profit_kz', name:'Profit.kz', lang:'ru', cat:'中亚', url:'https://profit.kz/rss/' },
  { id:'zakon_kz', name:'Zakon.kz', lang:'ru', cat:'中亚', url:'https://www.zakon.kz/rss' },
  { id:'nur_kz', name:'NUR.KZ', lang:'ru', cat:'中亚', url:'https://www.nur.kz/rss/all.rss' },
  { id:'spot_uz', name:'Spot.uz 乌兹别克', lang:'ru', cat:'中亚', url:'https://www.spot.uz/ru/rss/' },
  { id:'gazeta_uz', name:'Gazeta.uz', lang:'ru', cat:'中亚', url:'https://www.gazeta.uz/ru/rss/' },
  { id:'kun_uz', name:'Kun.uz', lang:'ru', cat:'中亚', url:'https://kun.uz/ru/rss' },
  { id:'akipress', name:'AKIpress 中亚', lang:'ru', cat:'中亚', url:'https://akipress.com/rss/news.rss' },
  { id:'24kg', name:'24.kg 吉尔吉斯', lang:'ru', cat:'中亚', url:'https://24.kg/rss/' },
  { id:'eurasianet', name:'Eurasianet', lang:'en', cat:'中亚', url:'https://eurasianet.org/rss.xml' },
  { id:'astanatimes', name:'Astana Times', lang:'en', cat:'中亚', url:'https://astanatimes.com/feed/' },
  { id:'caa_network', name:'CABAR 中亚分析', lang:'en', cat:'中亚', url:'https://cabar.asia/en/feed' },
  { id:'cnbc', name:'CNBC', lang:'en', cat:'财经', url:'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114' },
  { id:'cnbc_fx', name:'CNBC 外汇', lang:'en', cat:'汇率', url:'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258' },
  { id:'cnbc_econ', name:'CNBC 经济', lang:'en', cat:'财经', url:'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258' },
  { id:'ft_world', name:'Financial Times', lang:'en', cat:'财经', url:'https://www.ft.com/rss/home' },
  { id:'wsj_markets', name:'WSJ 市场', lang:'en', cat:'金融', url:'https://feeds.a.dj.com/rss/RSSMarketsMain.xml' },
  { id:'wsj_world', name:'WSJ 世界', lang:'en', cat:'国际', url:'https://feeds.a.dj.com/rss/RSSWorldNews.xml' },
  { id:'wsj_biz', name:'WSJ 商业', lang:'en', cat:'财经', url:'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml' },
  { id:'economist_fin', name:'Economist 财经', lang:'en', cat:'财经', url:'https://www.economist.com/finance-and-economics/rss.xml' },
  { id:'investing', name:'Investing.com', lang:'en', cat:'金融', url:'https://www.investing.com/rss/news.rss' },
  { id:'investing_fx', name:'Investing 外汇', lang:'en', cat:'汇率', url:'https://www.investing.com/rss/news_1.rss' },
  { id:'investing_eco', name:'Investing 经济', lang:'en', cat:'财经', url:'https://www.investing.com/rss/news_14.rss' },
  { id:'investing_comm', name:'Investing 商品', lang:'en', cat:'金融', url:'https://www.investing.com/rss/news_11.rss' },
  { id:'bbc_biz', name:'BBC 商业', lang:'en', cat:'财经', url:'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { id:'bbc_world', name:'BBC 世界', lang:'en', cat:'国际', url:'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id:'guardian_biz', name:'Guardian 商业', lang:'en', cat:'财经', url:'https://www.theguardian.com/business/rss' },
  { id:'marketwatch', name:'MarketWatch', lang:'en', cat:'金融', url:'http://feeds.marketwatch.com/marketwatch/topstories/' },
  { id:'yahoo_fin', name:'Yahoo Finance', lang:'en', cat:'金融', url:'https://finance.yahoo.com/news/rssindex' },
  { id:'aljazeera_eco', name:'Al Jazeera 经济', lang:'en', cat:'财经', url:'https://www.aljazeera.com/xml/rss/all.xml' },
  { id:'reuters_wb', name:'World Bank', lang:'en', cat:'财经', url:'https://www.worldbank.org/en/news/all?format=rss' },
  { id:'caixin', name:'财新网', lang:'zh', cat:'财经', url:'http://www.caixin.com/rss/all.xml' },
  { id:'ftchinese', name:'FT中文网', lang:'zh', cat:'财经', url:'http://www.ftchinese.com/rss/news' },
  { id:'cls', name:'财联社', lang:'zh', cat:'金融', url:'https://www.cls.cn/rss' },
  { id:'wallstreetcn', name:'华尔街见闻', lang:'zh', cat:'金融', url:'https://dedicated.wallstreetcn.com/rss.xml' },
  { id:'yicai', name:'第一财经', lang:'zh', cat:'财经', url:'https://www.yicai.com/rss/news.xml' },
  { id:'zaobao', name:'联合早报', lang:'zh', cat:'国际', url:'https://www.zaobao.com/realtime/world/rss.xml' },
  { id:'bbc_zh', name:'BBC中文', lang:'zh', cat:'国际', url:'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml' },
  { id:'dw_zh', name:'德国之声中文', lang:'zh', cat:'国际', url:'https://rss.dw.com/rdf/rss-chi-all' },
  { id:'rfi_zh', name:'法广中文', lang:'zh', cat:'国际', url:'https://www.rfi.fr/cn/rss' },
  { id:'rbc', name:'РБК (RBC)', lang:'ru', cat:'财经', url:'https://rssexport.rbc.ru/rbcnews/news/30/full.rss' },
  { id:'vedomosti', name:'Ведомости', lang:'ru', cat:'财经', url:'https://www.vedomosti.ru/rss/news' },
  { id:'tass_eco', name:'ТАСС', lang:'ru', cat:'财经', url:'https://tass.ru/rss/v2.xml' },
  { id:'forbes_ru', name:'Forbes Russia', lang:'ru', cat:'金融', url:'https://www.forbes.ru/newrss.xml' },
  { id:'kommersant', name:'Коммерсантъ', lang:'ru', cat:'财经', url:'https://www.kommersant.ru/RSS/news.xml' },
  { id:'interfax', name:'Интерфакс', lang:'ru', cat:'财经', url:'https://www.interfax.ru/rss.asp' },
  { id:'finam', name:'Finam 金融', lang:'ru', cat:'金融', url:'https://www.finam.ru/analysis/conews/rsspoint/' }
];

const CA_KEYS = {
  汇率: ['тенге','tenge','kzt','сум','сом','доллар','курс','рубль','валют','девальв','exchange','currency','汇率','坚戈','索姆'],
  利率: ['ставк','процент','нацбанк','центробанк','инфляц','rate','interest','inflation','央行','利率','基准','通胀'],
  贸易: ['экспорт','импорт','торгов','таможн','граница','транзит','trade','export','import','customs','贸易','出口','进口','海关','过境']
};

async function fetchFeed(feed) {
  try {
    const data = await parser.parseURL(feed.url);
    return (data.items || []).slice(0, 20).map(item => {
      const title = (item.title || '').trim();
      const summary = stripHtml(item.contentSnippet || item.content || item.summary || '').slice(0, 200);
      return {
        id: hashId(item.link || title),
        title, summary,
        link: item.link || item.guid || '',
        pubDate: item.isoDate || item.pubDate || null,
        ts: new Date(item.isoDate || item.pubDate || Date.now()).getTime(),
        source: feed.name, sourceId: feed.id, lang: feed.lang, cat: feed.cat,
        sub: feed.cat === '中亚' ? tagSub(title + ' ' + summary) : null
      };
    });
  } catch (e) { return []; }
}
function tagSub(text){const t=text.toLowerCase();const tags=[];for(const[k,arr]of Object.entries(CA_KEYS)){if(arr.some(w=>t.includes(w.toLowerCase())))tags.push(k)}return tags}
function stripHtml(s){return String(s).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()}
function hashId(s){let h=0;s=String(s);for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0}return 'n'+Math.abs(h)}

async function getAll(){
  let all=cache.get('all');
  if(all)return all;
  const results=await Promise.all(FEEDS.map(fetchFeed));
  all=results.flat();
  const seen=new Set();
  all=all.filter(n=>n.title&&n.link&&!seen.has(n.link)&&seen.add(n.link)).sort((a,b)=>b.ts-a.ts);
  cache.set('all',all);
  return all;
}

app.get('/api/news', async (req,res)=>{
  const{lang,cat,source,q,sub}=req.query;
  let out=await getAll();
  if(lang&&lang!=='all')out=out.filter(n=>n.lang===lang);
  if(cat&&cat!=='all')out=out.filter(n=>n.cat===cat);
  if(source&&source!=='all')out=out.filter(n=>n.sourceId===source);
  if(sub&&sub!=='all')out=out.filter(n=>n.sub&&n.sub.includes(sub));
  if(q){const kw=q.toLowerCase();out=out.filter(n=>(n.title+n.summary).toLowerCase().includes(kw))}
  res.json({count:out.length,updated:Date.now(),items:out.slice(0,300)});
});

app.get('/api/ca-analysis', async (req,res)=>{
  const all=await getAll();const ca=all.filter(n=>n.cat==='中亚');
  const stat={汇率:0,利率:0,贸易:0,其他:0,total:ca.length};
  ca.forEach(n=>{if(!n.sub||!n.sub.length)stat.其他++;else n.sub.forEach(s=>stat[s]++)});
  res.json({stat,last:ca[0]?ca[0].ts:null,sources:[...new Set(ca.map(n=>n.source))]});
});

app.post('/api/translate', async (req,res)=>{
  if(!ANTHROPIC_KEY)return res.json({error:'未配置 ANTHROPIC_API_KEY',map:{}});
  const items=(req.body.items||[]).filter(i=>i.lang!=='zh').slice(0,40);
  if(!items.length)return res.json({map:{}});
  const key='tr_'+hashId(items.map(i=>i.id + ':' + (i.summary || '')).join(','));
  const cached=aiCache.get(key);if(cached)return res.json({map:cached});
  try{
    const list=items.map((i,idx)=>`${idx+1}. 标题：${i.title}\n摘录：${i.summary || ''}`).join('\n\n');
    const prompt=`把下列财经新闻的标题和摘录翻译成简体中文，专业准确，适合财经看板直接展示。只返回JSON数组，不要任何解释或markdown。数组每项格式必须是 {"title":"中文标题","summary":"中文摘录"}，顺序与输入一致：\n${list}`;
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-3-5-haiku-20241022',max_tokens:4000,messages:[{role:'user',content:prompt}]})
    });
    const d=await r.json();
    let txt=(d.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('').trim();
    txt=txt.replace(/```json|```/g,'').trim();
    const arr=JSON.parse(txt);
    const map={};items.forEach((it,idx)=>{if(arr[idx])map[it.id]=arr[idx]});
    aiCache.set(key,map);
    res.json({map});
  }catch(e){res.json({error:'翻译失败',map:{}})}
});

app.post('/api/brief', async (req,res)=>{
  if(!ANTHROPIC_KEY)return res.json({error:'未配置 ANTHROPIC_API_KEY',brief:''});
  const scope=req.body.scope||'global';
  const key='brief_'+scope;
  const cached=aiCache.get(key);if(cached)return res.json({brief:cached});
  try{
    const all=await getAll();
    const items=(scope==='ca'?all.filter(n=>n.cat==='中亚'):all).slice(0,40);
    const list=items.map(i=>`- [${i.cat}] ${i.title}`).join('\n');
    const focus=scope==='ca'?'重点关注哈萨克斯坦及中亚的贸易、利率、汇率动态':'重点关注全球财经、金融市场、汇率走势';
    const prompt=`你是一位面向中国外贸企业（主营对中亚PP编织袋出口）的财经分析师。根据以下今日新闻标题，${focus}，用简体中文写一份简明扼要的新闻简报。要求：1) 开头一句话总览；2) 分3-5个要点，每点1-2句，聚焦对中亚贸易和汇率成本的影响；3) 结尾一句行动建议。不要用markdown标题符号，用自然段落和"·"列点。新闻：\n${list}`;
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-3-5-haiku-20241022',max_tokens:1200,messages:[{role:'user',content:prompt}]})
    });
    const d=await r.json();
    const brief=(d.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('').trim();
    aiCache.set(key,brief);
    res.json({brief});
  }catch(e){res.json({error:'简报生成失败',brief:''})}
});

app.get('/api/fx', async (req,res)=>{
  let fx=fxCache.get('fx');
  if(!fx){
    try{
      const r=await fetch('https://open.er-api.com/v6/latest/USD');
      const d=await r.json();const rates=d.rates||{};
      fx={base:'USD',updated:d.time_last_update_unix?d.time_last_update_unix*1000:Date.now(),
        rates:{'USD/KZT':rates.KZT,'USD/UZS':rates.UZS,'USD/RUB':rates.RUB,'USD/CNY':rates.CNY,'USD/EUR':rates.EUR,
          'CNY/KZT':rates.KZT&&rates.CNY?rates.KZT/rates.CNY:null,'CNY/RUB':rates.RUB&&rates.CNY?rates.RUB/rates.CNY:null,'EUR/KZT':rates.KZT&&rates.EUR?rates.KZT/rates.EUR:null}};
      fxCache.set('fx',fx);
    }catch(e){return res.json({error:'汇率获取失败',rates:{}})}
  }
  res.json(fx);
});

app.get('/api/sources',(req,res)=>res.json(FEEDS.map(f=>({id:f.id,name:f.name,lang:f.lang,cat:f.cat}))));
app.get('/api/refresh',(req,res)=>{cache.del('all');fxCache.del('fx');aiCache.flushAll();res.json({ok:true})});
const staticDir = path.join(__dirname, 'dist');
app.use(express.static(staticDir));
app.get(/.*/,(req,res)=>res.sendFile(path.join(staticDir,'index.html')));
app.listen(PORT,()=>console.log(`News app v2 running on ${PORT}`));

import {
  Banknote,
  Building2,
  ChartCandlestick,
  Landmark,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Bank = {
  name: string;
  brand: string;
  fx: string;
  deposit: string;
  rateKzt: number;
  rateUsd: number;
  term: string;
  liquidity: string;
  risk: "低" | "中" | "偏高";
  source: string;
};

export type Stock = {
  ticker: string;
  name: string;
  venue: string;
  sector: string;
  price: number;
  currency: "KZT" | "USD";
  change: number;
  dividend: number;
  pe: number;
  view: "价值" | "成长" | "周期" | "防御";
  risk: "低" | "中" | "偏高";
  source: string;
};

export type SourceLink = {
  label: string;
  description: string;
  url: string;
  icon: LucideIcon;
};

export const banks: Bank[] = [
  {
    name: "Halyk Bank",
    brand: "大型零售银行",
    fx: "USD/EUR/RUB",
    deposit: "在线存款",
    rateKzt: 14.2,
    rateUsd: 1.0,
    term: "12M",
    liquidity: "可线上管理",
    risk: "低",
    source: "https://halykbank.kz/deposits",
  },
  {
    name: "Kaspi Bank",
    brand: "超级 App 银行",
    fx: "App 内报价",
    deposit: "Kaspi Deposit",
    rateKzt: 13.8,
    rateUsd: 0.6,
    term: "12M",
    liquidity: "强",
    risk: "中",
    source: "https://kaspi.kz",
  },
  {
    name: "ForteBank",
    brand: "综合商业银行",
    fx: "柜台/线上",
    deposit: "标准存款",
    rateKzt: 14.0,
    rateUsd: 0.8,
    term: "12M",
    liquidity: "中",
    risk: "中",
    source: "https://forte.kz",
  },
  {
    name: "Jusan Bank",
    brand: "零售与企业银行",
    fx: "线上报价",
    deposit: "储蓄存款",
    rateKzt: 13.4,
    rateUsd: 0.7,
    term: "12M",
    liquidity: "中",
    risk: "中",
    source: "https://jusan.kz",
  },
  {
    name: "Bank CenterCredit",
    brand: "本土综合银行",
    fx: "银行报价",
    deposit: "BCC Deposit",
    rateKzt: 14.5,
    rateUsd: 1.1,
    term: "12M",
    liquidity: "中",
    risk: "中",
    source: "https://www.bcc.kz",
  },
  {
    name: "Freedom Bank",
    brand: "金融科技/券商生态",
    fx: "银行报价",
    deposit: "Freedom Deposit",
    rateKzt: 14.7,
    rateUsd: 1.2,
    term: "12M",
    liquidity: "中",
    risk: "偏高",
    source: "https://bankffin.kz",
  },
];

export const fxSeries = [
  { month: "1月", USD: 505.5, EUR: 528.4, RUB: 5.05 },
  { month: "2月", USD: 498.2, EUR: 521.8, RUB: 5.2 },
  { month: "3月", USD: 492.7, EUR: 535.2, RUB: 5.55 },
  { month: "4月", USD: 513.1, EUR: 583.6, RUB: 6.18 },
  { month: "5月", USD: 510.6, EUR: 578.9, RUB: 6.37 },
  { month: "6月", USD: 471.8, EUR: 539.3, RUB: 5.98 },
];

export const policyCards = [
  {
    title: "央行汇率机制",
    value: "KASE 15:30 加权均价",
    note: "USD/KZT 官方汇率基于 KASE USDKZT_TOM 交易结果形成，其他货币以交叉汇率计算。",
    source: "https://nationalbank.kz/en/news/suraqtar",
  },
  {
    title: "存款保障上限",
    value: "20M / 10M / 5M KZT",
    note: "储蓄型本币存款最高 2000 万坚戈；其他本币存款 1000 万；外币存款等值 500 万。",
    source: "https://egov.kz/cms/en/articles/deposit_guarantee_system",
  },
  {
    title: "利率观察",
    value: "高利率周期",
    note: "存款收益应与通胀、基准利率、汇率波动和银行风险一起评估。",
    source: "https://nationalbank.kz/en",
  },
];

export const stocks: Stock[] = [
  {
    ticker: "HSBK",
    name: "Halyk Bank",
    venue: "KASE/AIX/LSE GDR",
    sector: "银行",
    price: 320.1,
    currency: "KZT",
    change: 1.8,
    dividend: 13.2,
    pe: 3.8,
    view: "价值",
    risk: "中",
    source: "https://halykbank.com/about-us",
  },
  {
    ticker: "KSPI",
    name: "Kaspi.kz",
    venue: "NASDAQ/KASE",
    sector: "金融科技",
    price: 87.4,
    currency: "USD",
    change: -0.7,
    dividend: 7.1,
    pe: 8.9,
    view: "成长",
    risk: "偏高",
    source: "https://ir.kaspi.kz",
  },
  {
    ticker: "KAP",
    name: "Kazatomprom",
    venue: "KASE/AIX/LSE GDR",
    sector: "铀矿",
    price: 18950,
    currency: "KZT",
    change: 2.4,
    dividend: 5.9,
    pe: 9.8,
    view: "周期",
    risk: "偏高",
    source: "https://www.kazatomprom.kz/en/investors",
  },
  {
    ticker: "KZTK",
    name: "Kazakhtelecom",
    venue: "KASE",
    sector: "电信",
    price: 37600,
    currency: "KZT",
    change: 0.4,
    dividend: 8.5,
    pe: 6.5,
    view: "防御",
    risk: "中",
    source: "https://telecom.kz",
  },
  {
    ticker: "KCEL",
    name: "Kcell",
    venue: "KASE",
    sector: "移动通信",
    price: 2920,
    currency: "KZT",
    change: -1.1,
    dividend: 9.6,
    pe: 7.2,
    view: "防御",
    risk: "中",
    source: "https://www.kcell.kz",
  },
  {
    ticker: "KEGC",
    name: "KEGOC",
    venue: "KASE",
    sector: "电力基础设施",
    price: 1510,
    currency: "KZT",
    change: 0.9,
    dividend: 11.1,
    pe: 5.9,
    view: "价值",
    risk: "低",
    source: "https://www.kegoc.kz/en/investors/",
  },
];

export const stockIndexSeries = [
  { month: "1月", KASE: 7031, AIXQI: 1192 },
  { month: "2月", KASE: 7210, AIXQI: 1210 },
  { month: "3月", KASE: 7428, AIXQI: 1244 },
  { month: "4月", KASE: 7590, AIXQI: 1261 },
  { month: "5月", KASE: 7754, AIXQI: 1278 },
  { month: "6月", KASE: 7838, AIXQI: 1285 },
];

export const sectorMix = [
  { name: "银行/金融科技", value: 38 },
  { name: "资源", value: 24 },
  { name: "电信", value: 17 },
  { name: "公用事业", value: 13 },
  { name: "其他", value: 8 },
];

export const sourceLinks: SourceLink[] = [
  {
    label: "National Bank",
    description: "官方汇率、货币政策、基准利率入口",
    url: "https://nationalbank.kz/en",
    icon: Landmark,
  },
  {
    label: "KDIF / eGov",
    description: "存款保障制度与最高赔付上限",
    url: "https://egov.kz/cms/en/articles/deposit_guarantee_system",
    icon: ShieldCheck,
  },
  {
    label: "KASE",
    description: "哈萨克斯坦证券交易所指数、股票与公告",
    url: "https://kase.kz/en",
    icon: LineChart,
  },
  {
    label: "AIX",
    description: "阿斯塔纳国际交易所市场数据与官方列表",
    url: "https://market.aixkz.com/official-list",
    icon: ChartCandlestick,
  },
  {
    label: "银行官网",
    description: "各银行存款、汇率、产品规则入口",
    url: "https://halykbank.kz/en/exchange-rates",
    icon: Banknote,
  },
  {
    label: "上市公司 IR",
    description: "Halyk、Kaspi、Kazatomprom 等投资者关系",
    url: "https://www.kazatomprom.kz/en/investors",
    icon: Building2,
  },
];

export interface GlossaryTerm {
  term: string;
  definition: string;
}

const GLOSSARY: GlossaryTerm[] = [
  { term: "유상증자", definition: "회사가 새 주식을 발행하여 투자자로부터 돈을 받고 파는 것. 기존 주주의 지분이 희석될 수 있음." },
  { term: "무상증자", definition: "회사가 이익잉여금 등을 자본금으로 전환하여 기존 주주에게 무료로 새 주식을 나눠주는 것." },
  { term: "전환사채", definition: "일정 조건에서 주식으로 전환할 수 있는 채권(CB). 전환 시 주식 수가 늘어나 지분 희석 가능." },
  { term: "신주인수권부사채", definition: "채권에 신주를 인수할 권리가 붙어 있는 채권(BW). 권리 행사 시 지분 희석 가능." },
  { term: "교환사채", definition: "발행회사가 보유한 다른 회사 주식으로 교환할 수 있는 채권(EB)." },
  { term: "자기주식", definition: "회사가 자사의 주식을 매입하여 보유하는 것. 소각 시 주주가치 상승, 처분 시 희석 가능." },
  { term: "자기주식취득", definition: "회사가 시장에서 자사 주식을 사들이는 행위. 주가 방어 및 주주환원 목적." },
  { term: "자기주식처분", definition: "보유 중인 자사 주식을 시장에 매도하거나 제3자에게 넘기는 행위." },
  { term: "감자", definition: "자본금을 줄이는 것. 유상감자(주주에 환급)와 무상감자(결손 보전) 구분." },
  { term: "무상감자", definition: "결손금을 보전하기 위해 주주에게 대가 없이 주식 수를 줄이는 것. 주주 손실 발생." },
  { term: "합병", definition: "두 개 이상의 회사가 하나로 합쳐지는 것. 합병비율에 따라 주주 지분이 변동." },
  { term: "분할", definition: "하나의 회사를 둘 이상으로 나누는 것. 인적분할(주주 배분)과 물적분할(자회사화) 구분." },
  { term: "인적분할", definition: "분할되는 회사의 주식을 기존 주주에게 지분율대로 배분하는 분할." },
  { term: "물적분할", definition: "분할되는 사업부를 100% 자회사로 만드는 분할. 주주에게 직접 지분 미배분." },
  { term: "상장폐지", definition: "거래소에서 주식 거래가 불가능해지는 것. 투자금 회수가 매우 어려워짐." },
  { term: "공개매수", definition: "불특정 다수의 주주로부터 일정 가격에 주식을 매입하겠다고 공개 제안하는 것." },
  { term: "주식매수청구권", definition: "합병·분할 등 중요 결정에 반대하는 주주가 회사에 자기 주식을 사달라고 요구할 수 있는 권리." },
  { term: "대규모내부거래", definition: "회사와 특수관계인 간의 일정 규모 이상 거래. 사익편취 우려로 공시 의무." },
  { term: "최대주주변경", definition: "회사의 최대주주가 바뀌는 것. 경영권 변동 신호로 주가에 큰 영향." },
  { term: "타법인주식취득", definition: "다른 회사의 주식을 대량으로 사들이는 것. M&A 또는 전략적 투자 목적." },
  { term: "영업양수도", definition: "사업의 전부 또는 일부를 다른 회사에 넘기거나 받는 것." },
  { term: "반기보고서", definition: "사업연도 전반기(6개월) 실적을 담은 정기 보고서." },
  { term: "사업보고서", definition: "1년간의 경영 실적과 재무상태를 종합 정리한 정기 보고서." },
  { term: "분기보고서", definition: "분기(3개월) 실적을 담은 정기 보고서." },
  { term: "주요사항보고서", definition: "회사에 중요한 변동 사항(증자, 감자, 합병 등) 발생 시 즉시 공시하는 보고서." },
  { term: "단기차입금증가", definition: "1년 이내 상환 의무가 있는 차입금이 크게 늘어난 것. 유동성 리스크 신호." },
  { term: "채무보증", definition: "다른 회사의 빚을 대신 갚겠다고 보증하는 것. 보증 대상 부실 시 손실 가능." },
  { term: "횡령", definition: "회사의 재산을 부당하게 빼돌리는 행위. 발각 시 주가 급락 및 상폐 위험." },
  { term: "배당", definition: "회사가 벌어들인 이익의 일부를 주주에게 나눠주는 것." },
  { term: "액면분할", definition: "주식 1주의 액면가를 쪼개어 주식 수를 늘리는 것. 총 가치는 변동 없음." },
];

// 긴 용어부터 매칭 (longest match first)
export const SORTED_GLOSSARY = [...GLOSSARY].sort(
  (a, b) => b.term.length - a.term.length,
);

export const GLOSSARY_MAP = new Map(
  GLOSSARY.map((g) => [g.term, g.definition]),
);

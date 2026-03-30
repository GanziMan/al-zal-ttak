import type { Metadata } from "next";
import { getCompanyDividendCalendar, getCompanySummary } from "./data";

interface Props {
  params: Promise<{ corp_code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { corp_code } = await params;

  try {
    const [data, dividendCalendar] = await Promise.all([
      getCompanySummary(corp_code),
      getCompanyDividendCalendar(corp_code),
    ]);
    if (!data) return { title: "기업 정보" };
    const name = data.company?.corp_name ?? corp_code;
    const event = dividendCalendar?.event ?? null;
    const dividendPhrase = event?.last_confirmed_record_date
      ? `최근 확인된 배당 기준일은 ${event.last_confirmed_record_date}입니다.`
      : "배당 기준일 이력과 최근 배당 흐름을 확인할 수 있습니다.";
    const description = `${name}의 재무제표, 배당 이력, 대주주 현황을 확인하세요. ${dividendPhrase}`;

    return {
      title: `${name} 배당·재무 분석`,
      description,
      keywords: [
        `${name} 배당`,
        `${name} 배당 기준일`,
        `${name} 재무제표`,
        `${name} 공시`,
        `${name} 대주주`,
        "배당 기준일",
        "배당 이력",
        "기업 공시",
      ],
      alternates: {
        canonical: `/company/${corp_code}`,
      },
      openGraph: {
        title: `${name} 배당·재무 분석 | 공시딱`,
        description,
        url: `/company/${corp_code}`,
      },
    };
  } catch {
    return { title: "기업 정보" };
  }
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "공시딱 이용약관",
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">이용약관</h1>
        <p className="text-sm text-muted-foreground">
          시행일: 2026년 3월 27일
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. 서비스 성격</h2>
        <p className="text-sm leading-7 text-foreground/90">
          공시딱은 공시 데이터를 기반으로 한 정보 제공 서비스입니다. 서비스에 포함된 AI 분석, 점수, 코멘트는
          투자 참고용 정보이며, 특정 종목 매수·매도를 권유하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. 투자 판단과 책임</h2>
        <p className="text-sm leading-7 text-foreground/90">
          모든 투자 의사결정은 이용자 본인의 판단과 책임 하에 이루어집니다.
          서비스 제공자는 투자 결과에 대해 책임을 지지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. 정보 정확성</h2>
        <p className="text-sm leading-7 text-foreground/90">
          서비스는 데이터 품질 및 안정성 향상을 위해 노력하나, 외부 데이터 지연·누락·오류 또는 네트워크 장애로 인해
          정보 제공이 지연되거나 일부 부정확할 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. 서비스 변경 및 중단</h2>
        <p className="text-sm leading-7 text-foreground/90">
          서비스 품질 개선, 점검, 장애 대응 등을 위해 일부 기능이 변경되거나 일시 중단될 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. 금지 행위</h2>
        <ul className="list-disc pl-5 text-sm leading-7 text-foreground/90 space-y-1">
          <li>서비스의 정상 운영을 방해하는 행위</li>
          <li>자동화 수단을 이용한 과도한 요청 또는 무단 수집</li>
          <li>타인의 계정 도용, 권한 없는 접근 시도</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">6. 문의</h2>
        <p className="text-sm leading-7 text-foreground/90">
          약관 관련 문의는 아래 이메일로 접수해 주세요: <span className="font-medium">support@gongsittak.com</span>
        </p>
      </section>
    </section>
  );
}

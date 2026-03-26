import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "공시딱 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">개인정보처리방침</h1>
        <p className="text-sm text-muted-foreground">시행일: 2026년 3월 27일</p>
      </header>

      <p className="text-sm leading-7 text-foreground/90">
        공시딱(이하 &quot;서비스&quot;)은 이용자의 개인정보를 소중하게 생각하며,
        관련 법령을 준수합니다. 본 방침은 서비스 이용 과정에서 수집되는 정보,
        이용 목적, 보관 및 파기 기준을 안내합니다.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. 수집하는 정보</h2>
        <ul className="list-disc pl-5 text-sm leading-7 text-foreground/90 space-y-1">
          <li>로그인 식별 정보: 소셜 로그인 식별자, 닉네임(또는 표시 이름)</li>
          <li>서비스 이용 정보: 관심종목, 북마크, 메모, 설정값</li>
          <li>접속 및 기기 정보: 접속 로그, 브라우저 정보, 오류 로그, 쿠키</li>
        </ul>
        <p className="text-sm leading-7 text-foreground/90">
          서비스는 주민등록번호, 계좌번호 등 민감한 금융 개인정보를 수집하지
          않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. 개인정보 이용 목적</h2>
        <ul className="list-disc pl-5 text-sm leading-7 text-foreground/90 space-y-1">
          <li>로그인 및 회원 식별</li>
          <li>북마크, 메모, 관심종목 등 개인화 기능 제공</li>
          <li>서비스 안정성 확보, 오류 분석, 보안 대응</li>
          <li>공지사항 전달 및 고객 문의 응대</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. 보관 및 파기</h2>
        <p className="text-sm leading-7 text-foreground/90">
          개인정보는 수집 및 이용 목적이 달성되면 지체 없이 파기합니다. 관계
          법령에 따라 보관이 필요한 경우, 해당 기간 동안 안전하게 보관 후
          파기합니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. 제3자 제공 및 처리위탁</h2>
        <p className="text-sm leading-7 text-foreground/90">
          서비스는 원칙적으로 개인정보를 외부에 판매하거나 임의 제공하지
          않습니다. 다만 서비스 운영을 위해 인프라, 인증, 데이터 저장 등 필수
          업무가 외부 서비스 제공자를 통해 처리될 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. 이용자 권리</h2>
        <p className="text-sm leading-7 text-foreground/90">
          이용자는 언제든지 개인정보 조회, 수정, 삭제를 요청할 수 있으며, 계정
          삭제를 요청할 수 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">6. 문의</h2>
        <p className="text-sm leading-7 text-foreground/90">
          개인정보 관련 문의는 아래 이메일로 접수해 주세요:{" "}
          <span className="font-medium">qjatn50089@gmail.com</span>
        </p>
      </section>
    </section>
  );
}

import { Suspense } from "react";


export const metadata = {
  title: "Masuk | NobNob",
};

const messages = {
  oauth: "Login Google gagal. Silakan coba lagi.",
  denied: "Akses ditolak. Hubungi pengelola ruang kerja.",
  unavailable: "Login Google belum tersedia. Silakan coba lagi nanti.",
};

async function LoginStatus({ searchParams }) {
  const { error } = await searchParams;
  const message =
    typeof error === "string" && Object.hasOwn(messages, error)
      ? messages[error]
      : null;
  return message ? (
    <p id="google-login-status" role="alert" className="mt-[22px] rounded-[6px] border-l-[4px] border-solid border-[#a32033] bg-[#fff0f1] px-[16px] py-[14px] text-[13px] leading-[1.6] text-[#842032]">
      {message}
    </p>
  ) : null;
}

export default function LoginPage({ searchParams }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f8f1ed] p-[32px] [@media(max-width:700px)]:p-[16px]">
      <section className="grid w-[min(100%,1050px)] min-h-[600px] grid-cols-[1.04fr_1fr] overflow-hidden rounded-[24px] bg-white shadow-[0_24px_70px_#50263c1a] [@media(max-width:700px)]:min-h-0 [@media(max-width:700px)]:grid-cols-[minmax(0,1fr)]" aria-labelledby="login-title">
        <div className="relative flex flex-col overflow-hidden bg-[#542044] p-[clamp(32px,5vw,58px)] text-[#fff9f2] after:absolute after:right-[-180px] after:bottom-[-230px] after:h-[420px] after:w-[500px] after:rotate-[-25deg] after:rounded-[50%] after:bg-[#ef9fbd] after:content-[' '] [@media(max-width:700px)]:px-[28px] [@media(max-width:700px)]:py-[26px] [@media(max-width:700px)]:after:right-[-100px] [@media(max-width:700px)]:after:bottom-[-145px] [@media(max-width:700px)]:after:h-[220px] [@media(max-width:700px)]:after:w-[220px]">
          <p className="relative z-[1] font-[family-name:var(--font-museo),sans-serif] text-[25px] font-bold tracking-[-0.05em] [&_span]:text-[#f4afc8]">Nob<span>Nob</span></p>
          <p className="relative z-[1] mt-[62px] max-w-[380px] font-[family-name:var(--font-museo),sans-serif] text-[clamp(34px,4vw,49px)] leading-[1.13] font-bold tracking-[-0.045em] [&_span]:text-[#f4afc8] [@media(max-width:700px)]:mt-[24px] [@media(max-width:700px)]:max-w-[300px] [@media(max-width:700px)]:text-[28px]">Atur konten TikTok usahamu<span>.</span></p>
          <div className="relative mt-[20px] min-h-[250px] flex-1 [@media(max-width:700px)]:hidden" aria-hidden="true">
            <div className="absolute bottom-[-10px] left-[5%] h-[190px] w-[280px] rotate-[-20deg] rounded-[50%] border border-solid border-[#e6a7c080]" />
            <div className="absolute z-[1] bottom-[22px] left-[12%] h-[166px] w-[220px] rotate-[-8deg] rounded-[16px] bg-[#fff8ef] p-[18px] shadow-[0_14px_30px_#35112642]">
              <div className="flex gap-[8px] border-b-2 border-solid border-[#eddae1] pb-[14px] [&_i]:h-[10px] [&_i]:w-[10px] [&_i]:rounded-[50%] [&_i]:bg-[#a33e76]"><i /><i /></div>
              <div className="mt-[14px] grid grid-cols-[repeat(3,1fr)] gap-[10px] [&_i]:h-[20px] [&_i]:rounded-[5px] [&_i]:bg-[#f3dbe4] [&_i:nth-child(3n+2)]:bg-[#d87b9f]"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
            <div className="absolute z-[2] right-[1%] bottom-0 w-[145px] rotate-[9deg] rounded-[15px] bg-[#f0a5c1] p-[12px] shadow-[0_12px_24px_#35112633]">
              <div className="relative h-[82px] rounded-[8px] bg-[#7a315c] after:absolute after:top-1/2 after:left-1/2 after:translate-x-[-35%] after:translate-y-[-50%] after:border-t-[10px] after:border-b-[10px] after:border-l-[15px] after:border-solid after:border-t-transparent after:border-b-transparent after:border-l-[#fff8ef] after:content-[' ']" />
              <div className="mt-[10px] grid gap-[6px] [&_i]:h-[5px] [&_i]:rounded-[5px] [&_i]:bg-[#77345d] [&_i:last-child]:w-[60%]"><i /><i /></div>
            </div>
          </div>
        </div>

        <div className="flex items-center p-[clamp(32px,6vw,72px)] [@media(max-width:700px)]:px-[28px] [@media(max-width:700px)]:pt-[38px] [@media(max-width:700px)]:pb-[44px]">
          <div className="w-full">
            <h1 id="login-title" className="mt-[16px] font-[family-name:var(--font-museo),sans-serif] text-[clamp(30px,3.4vw,40px)] leading-[1.2] font-bold tracking-[-0.04em] text-[#35202e]">Masuk ke NobNob</h1>
            <form method="post" action="/api/auth/login" className="mt-[36px] [@media(max-width:700px)]:mt-[28px]">
              <button type="submit" className="flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-[12px] rounded-[10px] border border-solid border-[#cbbdc5] bg-white text-[14px] font-semibold text-[#35202e] transition-[background,border-color] duration-[150ms] ease-[ease] hover:border-[#96216f] hover:bg-[#fff8fc] focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-[#96216f] focus-visible:outline-offset-[3px]">
                <span aria-hidden="true" className="font-[family-name:Arial,sans-serif] text-[22px] leading-[1] font-bold text-[#175ac0]">G</span>
                Masuk dengan Google
              </button>
            </form>
            <p className="mt-[18px] text-[13px] leading-[1.7] text-[#60525b]">Gunakan akun Google yang sudah diberi akses oleh admin</p>
            <Suspense fallback={null}>
              <LoginStatus searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}

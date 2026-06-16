interface AwardBadgeProps {
  year?: number;
  type?: string;
}

export default function AwardBadge({ year, type }: Readonly<AwardBadgeProps>) {
  return (
    <>
      {year && type ? (
        <div className="xl:flex flex-col items-center relative top-0 animate-fadeIn">
          <div
            className="relative z-20 filter drop-shadow-sm hover:scale-105 transition-transform duration-300 cursor-pointer">
            <div
              className="bg-primary text-white font-bold text-[19px] py-2 px-10 shadow-md relative z-20 rounded-[2px]">
              GIẢI THƯỞNG {year}!
            </div>

            <div
              className="absolute top-[6px] -left-3.5 w-8 h-full bg-primary -z-20"
              style={{
                clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 100%, 50% 50%, 0px 0%)"
              }}
            />

            <div
              className="absolute top-[6px] -right-3.5 w-8 h-full bg-primary -z-20"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 0, 50% 50%, 100% 100%, 0 100%)"
              }}
            />
          </div>

          <div
            className="bg-white text-primary text-[14px] font-bold tracking-[0.15em] uppercase px-10 pt-6 pb-2.5 -mt-4 rounded-b-xl border border-primary w-full text-center whitespace-nowrap shadow-lg min-w-[310px] z-10 relative">
            Công Ty Tốt Nhất Việt Nam™
            <br />
            {type}
          </div>
        </div>
      ) : null}
    </>
  );
}

import middleLine from "../../assets/middle-line.svg";
import middleLineHor from "../../assets/middle-line-hor.svg";
import semi1 from "../../assets/semi1.svg";
import semi2 from "../../assets/semi2.svg";
import QuoteCard from "../QuoteCard/QuoteCard";

export default function Hero() {
  return (
    <section className="relative bg-[#141336] text-white min-h-screen px-6 md:px-16 lg:px-24 py-20 overflow-hidden">
      {/* Court lines layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Vertical middle line */}
        <img
          src={middleLine}
          alt=""
          className="absolute left-1/2 top-0 -translate-x-1/2 h-full opacity-70"
        />

        {/* Horizontal middle line */}
        <img
          src={middleLineHor}
          alt=""
          className="absolute top-1/2 left-0 -translate-y-1/2 w-full opacity-70"
        />

        {/* Left semicircle */}
        <img
          src={semi1}
          alt=""
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-70"
        />

        {/* Right semicircle */}
        <img
          src={semi2}
          alt=""
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-70"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full">

  {/* Headings */}
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
    <h1 className="font-stencil text-6xl sm:text-7xl md:text-8xl lg:text-[140px] leading-none tracking-wide">
      TOUCH
    </h1>

    <h1 className="font-stencil text-6xl sm:text-7xl md:text-8xl lg:text-[140px] leading-none tracking-wide">
      GRASS
    </h1>
  </div>

  {/* Spacer */}
  <div className="h-40 md:h-64"></div>

  {/* Quote */}
  <div>
    <QuoteCard />
  </div>

</div>  
    </section>
  );
}
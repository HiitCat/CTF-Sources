import Image from "next/legacy/image";

import Bepi from "@/assets/bepi.png";
import MouseSprinkles from "@/components/MouseSprinkles";

export default function HOB() {
  return (<>
    <MouseSprinkles />

    <p className="colorful-text text-5xl font-semibold text-center mt-16">
      HALL OF BOXES
    </p>

    <iframe
      width={560}
      height={315}
      src="https://www.youtube.com/embed/c4PqZp8nowQ?si=4Hfm69afRnUoYKgM"
      title="YouTube video player"
      frameBorder={0}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen=""
      className="mx-auto mt-16 rounded-2xl"
    />

    <div className="max-w-5xl grid grid-cols-3 mx-auto gap-4 mt-16">
      <div className="border border-white/10">
        <div className="border-b border-white/10">
          <Image
            src={Bepi}
            layout="responsive"
            alt="Bepi Frico's box"
            className="mx-auto aspect-square"
            height={256}
            width={256}
          />
        </div>

        <div className="p-2 bg-white/5">
          <p className="text-xl font-medium text-center colorful-text mt-1">Bepi Frico</p>

          <p className="text-sm font-light text-center text-white/60 mt-2 max-h-24 overflow-y-auto">
            Chronically coiled cardboard dweller, spends his day slithering through network packets all day hissing at firewalls.
            Larped being a 10-foot anaconda & owning premium terrarium real estate.
            Got his street cred by charming his way into CTF teams with hypnotic stare techniques.
{/* 
            <br />

            <span className="text-white font-normal">
              Box
            </span> */}
          </p>
        </div>
      </div>

      <div className="border border-white/10 bg-white/5 flex">
        <p className="text-lg text-center colorful-text m-auto">
          More boxes coming soon!
        </p>
      </div>
    </div>
  </>);
}

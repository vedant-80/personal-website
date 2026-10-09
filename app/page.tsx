import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/IMG_1748.jpeg";
import track from "@/assets/IMG_1747.jpeg";
import athlete from "@/assets/IMG_1745.jpeg";

const photos = [
  { image: portrait, alt: "Vedant smiling on a city street", label: "Along the way", className: "hero-photo-portrait" },
  { image: athlete, alt: "Vedant smiling in his running uniform", label: "On the track", className: "hero-photo-athlete" },
  { image: track, alt: "Vedant competing in a track race", label: "In motion", className: "hero-photo-track" },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A little corner of the internet</p>
          <h1 id="hero-title">Vedant<br /><span>Bhattacharyya</span><span className="hero-period">.</span></h1>
          <p className="hero-intro">A runner with a curious mind. Exploring tech, navigating college, and finding stories in the everyday.</p>
          <div className="hero-links">
            <Link href="/projects">Explore my projects <span aria-hidden="true">↗</span></Link>
            <Link href="/blog">Read my notes <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="hero-photos" aria-label="Three moments from my life">
          {photos.map((photo, index) => (
            <figure key={photo.label} className={`hero-photo ${photo.className}`}>
              <div className="photo-treatment">
                <Image src={photo.image} alt={photo.alt} fill sizes="(max-width: 640px) 32vw, (max-width: 1024px) 28vw, 310px" preload={index === 1} />
              </div>
              <figcaption><span className="photo-number">0{index + 1}</span>{photo.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="home-bottom" aria-label="More about this site">
        <p>Always curious.<br /><span>Always moving.</span></p>
        <Link href="/about">Get to know me <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}

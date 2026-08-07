"use client";

import { useRef, useState } from "react";
interface Props {
  images: string[];
  title: string;
}

export default function ImageSlider({ images, title }: Props) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  if (images.length === 0) {
    return (
      <img
        src="/images/no-image.jpg"
        alt="No Image"
        className="w-full h-72 object-cover"
      />
    );
  }

  const prev = () => {
    setCurrent((current - 1 + images.length) % images.length);
  };

  const next = () => {
    setCurrent((current + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
  
    // minimal geser 50px
    if (distance > 50) {
      next();
    } else if (distance < -50) {
      prev();
    }
  };

  return (
    <div
  className="relative"
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
      <img
        src={images[current]}
        alt={title}
        className="w-full h-72 object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 hover:bg-black/70"
          >
            ❮
          </button>

          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 hover:bg-black/70"
          >
            ❯
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full ${
                  current === i ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { resolvePhoto, isPhotoRef } from "@/lib/photos";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  fallback?: string;
};

export function Photo({ src, fallback, ...rest }: Props) {
  const [resolved, setResolved] = useState(() => (isPhotoRef(src) ? "" : src));

  useEffect(() => {
    let alive = true;
    if (isPhotoRef(src)) {
      resolvePhoto(src)
        .then((url) => {
          if (alive) setResolved(url);
        })
        .catch(() => {
          if (alive) setResolved("");
        });
    } else {
      setResolved(src);
    }
    return () => {
      alive = false;
    };
  }, [src]);

  if (!resolved) {
    return (
      <div
        className={`bg-muted animate-pulse ${rest.className ?? ""}`}
        style={rest.style}
        aria-label={rest.alt}
      />
    );
  }
  return <img width={1} height={1} {...rest} src={resolved || fallback} />;
}

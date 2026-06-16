import Image from "next/image";
import { RenderImageContext, RenderImageProps } from "react-photo-album";
import { useMemo } from "react";

export function RenderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext
) {

  // @ts-expect-error custom aria props
  const isLastWithMore: boolean = useMemo(() => photo['aria-isLastWithMore'], [photo]);

  // @ts-expect-error custom aria props
  const moreCount: number = useMemo(() => photo['aria-moreCount'], [photo]);

  return (
    <div
      className={`relative w-full`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={photo}
        alt={alt}
        fill
        title={title}
        sizes={sizes}
        className="object-cover rounded-xl"
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
      />

      {isLastWithMore && (
        <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
          <span className="text-white text-2xl font-semibold">
            +{moreCount}
          </span>
        </div>
      )}
    </div>
  );
}

export function RenderBlogImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext
) {

  // @ts-expect-error custom aria props
  const isLastWithMore: boolean = useMemo(() => photo['aria-isLastWithMore'], [photo]);

  // @ts-expect-error custom aria props
  const moreCount: number = useMemo(() => photo['aria-moreCount'], [photo]);

  return (
    <div
      className={`relative w-full`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={photo}
        alt={alt}
        fill
        title={title}
        sizes={sizes}
        className="object-cover"
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
      />

      {isLastWithMore && (
        <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
          <span className="text-white text-2xl font-semibold">
            +{moreCount}
          </span>
        </div>
      )}
    </div>
  );
}
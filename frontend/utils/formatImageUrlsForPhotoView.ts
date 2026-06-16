import { Photo } from "react-photo-album";
import { MAX_DISPLAYED_IMAGES } from "@/constants/constant";

const formatImageUrlsForPhotoView = (originalUrls: string[] = []): Photo[] => {
  const urls = originalUrls.filter(Boolean);

  if (urls.length <= MAX_DISPLAYED_IMAGES) {
    return urls.map((url, index) => ({
      src: url,
      width: 16,
      height: 9,
      alt: `Image ${index + 1}`
    }));
  }

  const extraCount = urls.length - MAX_DISPLAYED_IMAGES;

  return urls.slice(0, MAX_DISPLAYED_IMAGES).map((url, index) => {
    if (index === MAX_DISPLAYED_IMAGES - 1) {
      return {
        src: url,
        width: 16,
        height: 9,
        alt: `Image ${index + 1}`,
        title: `+${extraCount} more`,
        "aria-isLastWithMore": true,
        "aria-moreCount": extraCount
      } as Photo & {
        "aria-isLastWithMore": boolean;
        "aria-moreCount": number;
      };
    }
    return { src: url, width: 16, height: 9, alt: `Image ${index + 1}` };
  });
};

export default formatImageUrlsForPhotoView;
import { getAssetPath } from "@/lib/paths";

interface IconImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  iconPath: string;
}

export function IconImg({ iconPath, ...props }: IconImgProps) {
  return <img src={getAssetPath(iconPath)} {...props} />;
}

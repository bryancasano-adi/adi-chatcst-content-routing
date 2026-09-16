interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      className={className}
      src="/chatcst-icon.svg"
      alt="ChatCST lightbulb"
      width="512"
      height="640"
    />
  );
}

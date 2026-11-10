/** La «N» de NEZU: un cuadrado naranja con la letra recortada en papel. Se usa en la barra lateral y en el acceso. */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="NEZU" focusable="false">
      <rect width="48" height="48" rx="12" fill="var(--orange)" />
      <path d="M14 34V14h4.6l10.8 13.1V14H34v20h-4.6L18.6 20.9V34z" fill="hsl(70 21% 94.5%)" />
    </svg>
  );
}

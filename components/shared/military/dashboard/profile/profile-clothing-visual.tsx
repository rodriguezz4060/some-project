import type { ClothingSizes } from "../../types";

interface Props {
  sizes?: ClothingSizes;
}

export function ProfileClothingVisual({ sizes }: Props) {
  if (!sizes) {
    return (
      <p className="py-8 text-center text-base text-muted-foreground">
        Розміри не вказано
      </p>
    );
  }

  const hasAny = Object.values(sizes).some((v) => v != null);

  if (!hasAny) {
    return (
      <p className="py-8 text-center text-base text-muted-foreground">
        Розміри не вказано
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
      <svg
        viewBox="0 0 200 400"
        className="size-56 shrink-0 sm:size-64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Голова */}
        <circle cx="100" cy="40" r="25" className="stroke-foreground/20" strokeWidth="2" />
        {/* Шия */}
        <line x1="100" y1="65" x2="100" y2="80" className="stroke-foreground/20" strokeWidth="2" />
        {/* Торс */}
        <rect
          x="65"
          y="80"
          width="70"
          height="130"
          rx="6"
          className="stroke-foreground/20"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.03"
        />
        {/* Ліва рука */}
        <line x1="65" y1="90" x2="38" y2="160" className="stroke-foreground/20" strokeWidth="2" />
        {/* Права рука */}
        <line x1="135" y1="90" x2="162" y2="160" className="stroke-foreground/20" strokeWidth="2" />
        {/* Ліва нога */}
        <line x1="85" y1="210" x2="75" y2="350" className="stroke-foreground/20" strokeWidth="2" />
        {/* Права нога */}
        <line x1="115" y1="210" x2="125" y2="350" className="stroke-foreground/20" strokeWidth="2" />
        {/* Ступні */}
        <line x1="70" y1="350" x2="85" y2="350" className="stroke-foreground/20" strokeWidth="2" />
        <line x1="115" y1="350" x2="130" y2="350" className="stroke-foreground/20" strokeWidth="2" />

        {/* Підписи розмірів */}
        {sizes.headgear && (
          <g>
            <line x1="100" y1="15" x2="175" y2="15" className="stroke-muted-foreground/40" strokeWidth="1" strokeDasharray="3 2" />
            <text x="166" y="12" textAnchor="end" className="fill-muted-foreground text-[9px] font-medium">
              {sizes.headgear}
            </text>
          </g>
        )}

        {sizes.height && (
          <g>
            <line x1="54" y1="55" x2="44" y2="55" className="stroke-muted-foreground/40" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="44" y1="40" x2="44" y2="350" className="stroke-muted-foreground/20" strokeWidth="1" strokeDasharray="3 3" />
            <text x="42" y="200" textAnchor="end" transform="rotate(-90 42 200)" className="fill-muted-foreground text-[9px] font-medium">
              {sizes.height}
            </text>
          </g>
        )}

        {sizes.chest && (
          <g>
            <line x1="140" y1="105" x2="190" y2="105" className="stroke-muted-foreground/40" strokeWidth="1" strokeDasharray="3 2" />
            <text x="188" y="109" textAnchor="end" className="fill-muted-foreground text-[9px] font-medium">
              {sizes.chest}
            </text>
          </g>
        )}

        {sizes.waist && (
          <g>
            <line x1="140" y1="170" x2="190" y2="170" className="stroke-muted-foreground/40" strokeWidth="1" strokeDasharray="3 2" />
            <text x="188" y="174" textAnchor="end" className="fill-muted-foreground text-[9px] font-medium">
              {sizes.waist}
            </text>
          </g>
        )}

        {sizes.uniform && (
          <g>
            <line x1="65" y1="195" x2="30" y2="195" className="stroke-muted-foreground/40" strokeWidth="1" strokeDasharray="3 2" />
            <text x="28" y="199" textAnchor="end" className="fill-muted-foreground text-[9px] font-medium">
              {sizes.uniform}
            </text>
          </g>
        )}

        {sizes.shoes && (
          <g>
            <line x1="130" y1="360" x2="190" y2="360" className="stroke-muted-foreground/40" strokeWidth="1" strokeDasharray="3 2" />
            <text x="188" y="364" textAnchor="end" className="fill-muted-foreground text-[9px] font-medium">
              {sizes.shoes}
            </text>
          </g>
        )}
      </svg>

      {/* Додатковий текстовий список */}
      <div className="space-y-1.5 text-base">
        {sizes.height && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground min-w-28">Зріст</span>
            <span className="font-medium">{sizes.height}</span>
          </div>
        )}
        {sizes.chest && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground min-w-28">Груди</span>
            <span className="font-medium">{sizes.chest}</span>
          </div>
        )}
        {sizes.waist && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground min-w-28">Талія</span>
            <span className="font-medium">{sizes.waist}</span>
          </div>
        )}
        {sizes.shoes && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground min-w-28">Взуття</span>
            <span className="font-medium">{sizes.shoes}</span>
          </div>
        )}
        {sizes.headgear && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground min-w-28">Головний убір</span>
            <span className="font-medium">{sizes.headgear}</span>
          </div>
        )}
        {sizes.uniform && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground min-w-28">Форма</span>
            <span className="font-medium">{sizes.uniform}</span>
          </div>
        )}
      </div>
    </div>
  );
}

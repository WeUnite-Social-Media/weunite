interface AvatarProps {
  avatar: string;
  avatarColor: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar = ({
  avatar,
  avatarColor,
  name,
  size = "md",
  className = "",
}: AvatarProps) => {
  // Detecta se o avatar é uma URL de imagem
  const isImageUrl =
    avatar.startsWith("http") ||
    avatar.startsWith("data:") ||
    avatar.includes(".");

  // Define tamanhos
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const sizeClass = sizeClasses[size];

  if (isImageUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback para iniciais se a imagem falhar
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            if (target.parentElement) {
              target.parentElement.innerHTML = `
                <div class="${avatarColor} w-full h-full flex items-center justify-center font-medium">
                  ${name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  // Renderiza iniciais
  return (
    <div
      className={`${sizeClass} rounded-full ${avatarColor} flex items-center justify-center font-medium ${className}`}
    >
      <span>{avatar}</span>
    </div>
  );
};

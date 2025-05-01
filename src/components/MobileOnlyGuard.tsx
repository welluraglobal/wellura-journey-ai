
import React from "react";

function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  // Matches Android, iOS, iPad OS
  return /android|iphone|ipad|ipod|ios/i.test(userAgent);
}

const MobileOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Instead of checking the device, we'll always allow access
  return <>{children}</>;
  
  // Previous implementation for reference:
  /*
  const [allowed, setAllowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setAllowed(isMobileDevice());
  }, []);

  if (allowed === null) {
    return <div className="min-h-screen flex items-center justify-center">Verificando dispositivo...</div>;
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
        <div className="p-8 rounded-lg shadow-xl bg-white max-w-md">
          <h2 className="text-xl font-bold mb-4 text-wellura-500">Esse app só está disponível em dispositivos móveis!</h2>
          <p className="mb-2">Por favor, acesse o Wellura App pelo seu celular Android ou iPhone.</p>
          <p className="text-muted-foreground text-xs">Se você já está usando o app em seu aparelho, garanta que seu navegador esteja atualizado ou instale nosso aplicativo via PWA ou loja de apps.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
  */
};

export default MobileOnlyGuard;

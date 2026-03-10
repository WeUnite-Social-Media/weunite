import { useEffect, useState } from "react";

export function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState(0);
  
  useEffect(() => {
    const calculateStrength = (pwd: string) => {
      if (!pwd) return 0;
      
      let score = 0;
      if (pwd.length >= 8) score += 20;
      if (/[A-Z]/.test(pwd)) score += 20;
      if (/[a-z]/.test(pwd)) score += 20;
      if (/[0-9]/.test(pwd)) score += 20;
      if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
      
      return score;
    };
    
    setStrength(calculateStrength(password || ""));
  }, [password]);
  
  return strength;
}
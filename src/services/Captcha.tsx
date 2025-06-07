import { useEffect, useRef, useState } from "react";
interface CaptchaProps {
    onSuccess: (token: string) => void
    setCaptchaTimeStamp: (stamp: number) => void
    setWidgetId: (id: string) => void
}
const CaptchaComponent: React.FC<CaptchaProps> = ({onSuccess, setCaptchaTimeStamp, setWidgetId}) => {
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstile_sitekey = process.env.REACT_APP_TURNSTILE_SITE_KEY

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.turnstile && turnstileRef.current) {
        // Only render once!
        const id:any = window.turnstile.render(turnstileRef.current, {
          sitekey: turnstile_sitekey,
          callback: (token: string) => {
            console.log("Captcha verified:", token);
            onSuccess(token);
            setCaptchaTimeStamp(Date.now());
          },
        });
        setWidgetId(id);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return <div ref={turnstileRef} />;
};

export default CaptchaComponent
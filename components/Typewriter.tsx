import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  isStreaming?: boolean;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 30, isStreaming }) => {
  const [displayText, setDisplayText] = useState('');
  const textToTypeRef = useRef(text); // Hedef metni saklamak için ref

  // Metin prop'u değiştiğinde ref'i güncelle.
  // Bu, aralık kapanışına en son metni yeniden başlatmadan kullanılabilir hale getirir.
  useEffect(() => {
    textToTypeRef.current = text;
  }, [text]);

  // Bu etki, aralığı ayarlamak için yalnızca bileşen yüklendiğinde bir kez çalışır.
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Hedef metni ref'ten al
      const targetText = textToTypeRef.current;
      setDisplayText(currentDisplayText => {
        // Tam hedef metni henüz göstermediysek...
        if (currentDisplayText.length < targetText.length) {
          // ...sonraki karakteri ekle.
          // Hedef metnin küçülmüş olabileceği durumları (olasılık dışı, ama güvenli) ele almak için slice kullanıyoruz.
          return targetText.slice(0, currentDisplayText.length + 1);
        }
        // Aksi takdirde, yetişmiş durumdayız. Değişiklik gerekmez.
        return currentDisplayText;
      });
    }, speed);

    // Bileşen kaldırıldığında temizleme
    return () => clearInterval(intervalId);
  }, [speed]); // Bağımlılık dizisi anahtardır. Sadece hız aralığı değiştirebilir.

  return (
    <>
      {displayText}
      {/* Yanıp sönen imleci yalnızca yazma işlemi devam ederken göster */}
      {isStreaming && <span className="blinking-cursor"></span>}
    </>
  );
};

export default Typewriter;
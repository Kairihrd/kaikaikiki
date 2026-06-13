import { useEffect, useState } from "react";
import { Text, type TextStyle } from "react-native";

interface CountdownProps {
  initialSeconds: number;
  style?: TextStyle | TextStyle[];
  prefix?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

// 1秒ごとに減っていくカウントダウン表示。0 で停止(デモ用)。
export default function Countdown({
  initialSeconds,
  style,
  prefix = "",
}: CountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <Text style={style}>
      {prefix}
      {pad(h)}:{pad(m)}:{pad(s)}
    </Text>
  );
}

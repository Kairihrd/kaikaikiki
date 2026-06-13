import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// 画面全体に固定で敷く、青・紫・ピンクの放射状グロー。
// 黒背景の上に作品カードが「空間に浮いている」印象を作る。
// react-native-svg の RadialGradient で本物のソフトグローを描画する。
export default function ScreenGlow() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="blue" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
            <Stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="purple" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#a855f7" stopOpacity={0.26} />
            <Stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="pink" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ec4899" stopOpacity={0.16} />
            <Stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={width * 0.1} cy={height * 0.12} r={width * 0.7} fill="url(#blue)" />
        <Circle cx={width * 0.95} cy={height * 0.4} r={width * 0.65} fill="url(#purple)" />
        <Circle cx={width * 0.3} cy={height * 0.95} r={width * 0.6} fill="url(#pink)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
});

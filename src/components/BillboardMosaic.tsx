import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import ArtworkCard from "./ArtworkCard";
import { type Artwork, type ArtworkSize } from "@/lib/mockData";

interface BillboardMosaicProps {
  artworks: Artwork[];
  /** グラデーション枠で強調する作品ID(既定は先頭) */
  highlightId?: string;
  /** 列数(既定2) */
  columns?: number;
}

// サイズごとのカード高さ。高さに差をつけてPinterest風のモザイクにする。
const SIZE_HEIGHT: Record<ArtworkSize, number> = {
  small: 130,
  medium: 178,
  large: 240,
  wide: 150,
  tall: 290,
};

const GAP = 10;

// React Native には CSS grid が無いため、カードを高さ付きで複数カラムに
// 振り分ける「masonry(石積み)」方式でビルボードのモザイク感を作る。
export default function BillboardMosaic({
  artworks,
  highlightId,
  columns = 2,
}: BillboardMosaicProps) {
  const highlight = highlightId ?? artworks[0]?.id;

  // 最も低い列へ順番に積んでいく(greedy)
  const columnItems = useMemo(() => {
    const cols: Artwork[][] = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);
    for (const art of artworks) {
      const target = heights.indexOf(Math.min(...heights));
      cols[target].push(art);
      heights[target] += SIZE_HEIGHT[art.size] + GAP;
    }
    return cols;
  }, [artworks, columns]);

  return (
    <View style={styles.row}>
      {columnItems.map((items, colIdx) => (
        <View key={colIdx} style={styles.column}>
          {items.map((art) => (
            <ArtworkCard
              key={art.id}
              artwork={art}
              height={SIZE_HEIGHT[art.size]}
              selected={art.id === highlight}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: GAP,
  },
  column: {
    flex: 1,
    gap: GAP,
  },
});

import qrcode from 'qrcode-generator';
import React, { useMemo } from 'react';
import { View } from 'react-native';

interface Props {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

/**
 * Pure-JS QR code rendered as React Native Views — no native module
 * (avoids the react-native-svg dependency used by react-native-qrcode-svg).
 * Each row is run-length encoded so we render a handful of Views per row
 * instead of one View per module.
 */
export default function QRCodeView({
  value,
  size = 200,
  color = '#1a2a4a',
  backgroundColor = '#ffffff',
}: Props) {
  const { rows, cellSize, dimension } = useMemo(() => {
    const qr = qrcode(0, 'M'); // type 0 = auto-fit to data length
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    const cs = Math.max(1, Math.floor(size / count));
    const dim = cs * count;

    const built: { offset: number; len: number }[][] = [];
    for (let r = 0; r < count; r++) {
      const segments: { offset: number; len: number }[] = [];
      let c = 0;
      while (c < count) {
        if (qr.isDark(r, c)) {
          let len = 1;
          while (c + len < count && qr.isDark(r, c + len)) len++;
          segments.push({ offset: c, len });
          c += len;
        } else {
          c++;
        }
      }
      built.push(segments);
    }
    return { rows: built, cellSize: cs, dimension: dim };
  }, [value, size]);

  return (
    <View style={{ width: dimension, height: dimension, backgroundColor }}>
      {rows.map((segments, r) => (
        <React.Fragment key={r}>
          {segments.map((s, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: r * cellSize,
                left: s.offset * cellSize,
                width: s.len * cellSize,
                height: cellSize,
                backgroundColor: color,
              }}
            />
          ))}
        </React.Fragment>
      ))}
    </View>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const OVAL_WIDTH = 260;
const OVAL_HEIGHT = 340;

interface OvalProgressProps {
    visible: boolean;
    duration?: number;
}

const OvalProgress = ({ visible, duration = 2000 }: OvalProgressProps) => {
    const progress = useRef(new Animated.Value(0)).current;
    const [arcPath, setArcPath] = useState<string>(generateArc(0));

    useEffect(() => {
        if (visible) {
            progress.setValue(0);

            const id = progress.addListener(({ value }) => {
                const path = generateArc(value);
                setArcPath(path);
            });

            Animated.timing(progress, {
                toValue: 1,
                duration,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start(() => {
                progress.removeListener(id);
            });
        } else {
            progress.stopAnimation();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.overlayContainer}>
            <Svg width={OVAL_WIDTH} height={OVAL_HEIGHT}>
                <Path
                    d={arcPath}
                    stroke="#4CAF50"
                    strokeWidth={4}
                    fill="none"
                />
            </Svg>
        </View>
    );
};

// Generates elliptical arc path
function generateArc(t: number): string {
    const cx = OVAL_WIDTH / 2;
    const cy = OVAL_HEIGHT / 2;
    const rx = OVAL_WIDTH / 2;
    const ry = OVAL_HEIGHT / 2;

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + t * 2 * Math.PI;

    const x = cx + rx * Math.cos(endAngle);
    const y = cy + ry * Math.sin(endAngle);

    const largeArcFlag = t > 0.5 ? 1 : 0;

    return `M ${cx},${cy - ry} A ${rx},${ry} 0 ${largeArcFlag} 1 ${x},${y}`;
}

// Style to position over scan area
const styles = StyleSheet.create({
    overlayContainer: {
        position: 'absolute',
        width: OVAL_WIDTH,
        height: OVAL_HEIGHT,
        top: '50%',
        left: '50%',
        transform: [{ translateX: -OVAL_WIDTH / 2 }, { translateY: -OVAL_HEIGHT / 2 }],
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
});

export default OvalProgress;

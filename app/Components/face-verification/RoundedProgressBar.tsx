// OvalProgressRing.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedProps,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const OvalProgressRing = ({ progress = 0, width = 200, height = 100, strokeWidth = 12, color = '#4CAF50' }) => {
    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(progress, { duration: 100 });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => {
        const radiusX = (width - strokeWidth) / 2;
        const radiusY = (height - strokeWidth) / 2;
        const centerX = width / 2;
        const centerY = height / 2;

        const startAngle = -Math.PI / 2; // start from top
        const endAngle = startAngle + Math.PI * 2 * animatedProgress.value;

        const startX = centerX + radiusX * Math.cos(startAngle);
        const startY = centerY + radiusY * Math.sin(startAngle);
        const endX = centerX + radiusX * Math.cos(endAngle);
        const endY = centerY + radiusY * Math.sin(endAngle);

        const largeArcFlag = animatedProgress.value > 0.5 ? 1 : 0;

        const d = `
      M ${startX} ${startY}
      A ${radiusX} ${radiusY} 0 ${largeArcFlag} 1 ${endX} ${endY}
    `;

        return {
            d,
        };
    });

    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width={width} height={height}>
                {/* Background arc */}
                <Path
                    d={describeFullOval(width, height, strokeWidth)}
                    stroke="#e0e0e0"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Animated progress arc */}
                <AnimatedPath
                    animatedProps={animatedProps}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                />
            </Svg>
        </View>
    );
};

const describeFullOval = (width: number, height: number, strokeWidth: number) => {
    const rx = (width - strokeWidth) / 2;
    const ry = (height - strokeWidth) / 2;
    const cx = width / 2;
    const cy = height / 2;

    return `
    M ${cx + rx} ${cy}
    A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy}
    A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy}
  `;
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OvalProgressRing;

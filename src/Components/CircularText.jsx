import { useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';

const getRotationTransition = (duration, from, loop = true) => ({
    from,
    to: from + 360,
    ease: 'linear',
    duration,
    type: 'tween',
    repeat: loop ? Infinity : 0
});

const getTransition = (duration, from) => ({
    rotate: getRotationTransition(duration, from),
    scale: {
        type: 'spring',
        damping: 20,
        stiffness: 300
    }
});

const CircularText = ({ text, spinDuration = 20, onHover = 'speedUp', className = '' }) => {
    const letters = Array.from(text);
    const controls = useAnimation();
    const rotation = useMotionValue(0);

    useEffect(() => {
        const start = rotation.get();
        controls.start({
            rotate: start + 360,
            scale: 1,
            transition: getTransition(spinDuration, start)
        });
    }, [spinDuration, text, onHover, controls, rotation]);

    const handleHoverStart = () => {
        const start = rotation.get();
        if (!onHover) return;

        let transitionConfig;
        let scaleVal = 1;

        switch (onHover) {
            case 'slowDown':
                transitionConfig = getTransition(spinDuration * 2, start);
                break;
            case 'speedUp':
                transitionConfig = getTransition(spinDuration / 4, start);
                break;
            case 'pause':
                transitionConfig = {
                    rotate: { type: 'spring', damping: 20, stiffness: 300 },
                    scale: { type: 'spring', damping: 20, stiffness: 300 }
                };
                scaleVal = 1;
                break;
            case 'goBonkers':
                transitionConfig = getTransition(spinDuration / 20, start);
                scaleVal = 0.8;
                break;
            default:
                transitionConfig = getTransition(spinDuration, start);
        }

        controls.start({
            rotate: start + 360,
            scale: scaleVal,
            transition: transitionConfig
        });
    };

    const handleHoverEnd = () => {
        const start = rotation.get();
        controls.start({
            rotate: start + 360,
            scale: 1,
            transition: getTransition(spinDuration, start)
        });
    };

    const circularTextStyle = {
        margin: '0 auto',
        borderRadius: '50%',
        width: '200px',
        position: 'relative',
        height: '200px',
        fontWeight: 900,
        color: '#fff',
        textAlign: 'center',
        cursor: 'pointer',
        transformOrigin: '50% 50%',
        WebkitTransformOrigin: '50% 50%'
    };

    const spanStyle = {
        position: 'absolute',
        display: 'inline-block',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        fontSize: '24px',
        transition: 'all 0.5s cubic-bezier(0, 0, 0, 1)'
    };

    return (
        <motion.div
            className={className}
            style={{ ...circularTextStyle, rotate: rotation }}
            initial={{ rotate: 0 }}
            animate={controls}
            onMouseEnter={handleHoverStart}
            onMouseLeave={handleHoverEnd}
        >
            {letters.map((letter, i) => {
                const rotationDeg = (360 / letters.length) * i;
                const factor = Math.PI / letters.length;
                const x = factor * i;
                const y = factor * i;
                const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

                return (
                    <span key={i} style={{ ...spanStyle, transform, WebkitTransform: transform }}>
                        {letter}
                    </span>
                );
            })}
        </motion.div>
    );
};

export default CircularText;

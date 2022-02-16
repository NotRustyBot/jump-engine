function clamp(x: number, lower: number, upper: number): number {
    return Math.max(Math.min(x, upper), lower);
}

function toRad(x: number): number {
    return (x / 180) * Math.PI;
}

function toDeg(x: number): number {
    return (x * 180) / Math.PI;
}


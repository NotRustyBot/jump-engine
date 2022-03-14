export function clamp(x: number, lower: number, upper: number): number {
    return Math.max(Math.min(x, upper), lower);
}

export function toRad(x: number): number {
    return (x / 180) * Math.PI;
}

export function toDeg(x: number): number {
    return (x * 180) / Math.PI;
}

export function transfer(to: any, from: any) {
    for (var k in from) to[k] = from[k];
}

export function makeId(length: number) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

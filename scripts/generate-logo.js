const { PNG } = require('pngjs');
const fs = require('fs');

function createImage(width, height, draw) {
    const png = new PNG({ width, height });
    // fill with transparent
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            png.data[idx] = 255; // r
            png.data[idx + 1] = 255; // g
            png.data[idx + 2] = 255; // b
            png.data[idx + 3] = 255; // a
        }
    }
    draw(png, width, height);
    return png;
}

function circle(png, cx, cy, r, color) {
    const { width, height } = png;
    for (let y = Math.max(0, cy - r); y < Math.min(height, cy + r); y++) {
        for (let x = Math.max(0, cx - r); x < Math.min(width, cx + r); x++) {
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy <= r * r) {
                const idx = (width * y + x) << 2;
                png.data[idx] = color[0];
                png.data[idx + 1] = color[1];
                png.data[idx + 2] = color[2];
                png.data[idx + 3] = color[3];
            }
        }
    }
}

function rect(png, x0, y0, w, h, color) {
    const { width, height } = png;
    for (let y = Math.max(0, y0); y < Math.min(height, y0 + h); y++) {
        for (let x = Math.max(0, x0); x < Math.min(width, x0 + w); x++) {
            const idx = (width * y + x) << 2;
            png.data[idx] = color[0];
            png.data[idx + 1] = color[1];
            png.data[idx + 2] = color[2];
            png.data[idx + 3] = color[3];
        }
    }
}

function generate() {
    // Icon (1024x1024)
    const icon = createImage(1024, 1024, (png, w, h) => {
        // purple background
        rect(png, 0, 0, w, h, [58, 53, 99, 255]);
        // white circle
        circle(png, w / 2, h / 2, 360, [255, 255, 255, 255]);
        // plus sign
        rect(png, w / 2 - 40, h / 2 - 140, 80, 280, [58, 53, 99, 255]);
        rect(png, w / 2 - 140, h / 2 - 40, 280, 80, [58, 53, 99, 255]);
        // small triangle to feel math-y
        rect(png, w / 2 + 120, h / 2 + 60, 32, 32, [58, 53, 99, 255]);
    });
    icon.pack().pipe(fs.createWriteStream('assets/icon.png'));

    // Adaptive icon foreground (432x432)
    const fg = createImage(432, 432, (png, w, h) => {
        rect(png, 0, 0, w, h, [0, 0, 0, 0]);
        circle(png, w / 2, h / 2, 180, [255, 255, 255, 255]);
        rect(png, w / 2 - 16, h / 2 - 62, 32, 124, [58, 53, 99, 255]);
        rect(png, w / 2 - 62, h / 2 - 16, 124, 32, [58, 53, 99, 255]);
    });
    fg.pack().pipe(fs.createWriteStream('assets/adaptive-icon.png'));

    // Splash (1242x2436) - large vertical
    const splash = createImage(1242, 2436, (png, w, h) => {
        rect(png, 0, 0, w, h, [255, 255, 255, 255]);
        // big purple circle in center
        circle(png, w / 2, h / 2 - 120, 440, [58, 53, 99, 255]);
        // small white circle inside
        circle(png, w / 2, h / 2 - 120, 320, [255, 255, 255, 255]);
        // plus sign
        rect(png, w / 2 - 60, h / 2 - 260, 120, 420, [58, 53, 99, 255]);
        rect(png, w / 2 - 260, h / 2 - 60, 520, 120, [58, 53, 99, 255]);
    });
    splash.pack().pipe(fs.createWriteStream('assets/splash.png'));

    // favicon (256x256)
    const fav = createImage(256, 256, (png, w, h) => {
        rect(png, 0, 0, w, h, [58, 53, 99, 255]);
        circle(png, w / 2, h / 2, 96, [255, 255, 255, 255]);
    });
    fav.pack().pipe(fs.createWriteStream('assets/favicon.png'));

    console.log('Generated assets: assets/icon.png, assets/adaptive-icon.png, assets/splash.png, assets/favicon.png');
}

generate();

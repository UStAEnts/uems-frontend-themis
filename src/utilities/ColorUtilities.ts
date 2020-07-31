export class ColorUtilities {
    /**
     * A regex format that matches hex color codes either in three parts (ie #000) or 6 parts (ie #000000) with or
     * without the # symbol (case insensitive)
     */
    static readonly HEX_REGEX = /^#?([0-9a-f]{3}([0-9a-f]{3})?)/i;

    /**
     * Uses the formula outlined in this (https://stackoverflow.com/a/3943023) stack overflow post based on the ITU-R
     * recommendation BT.709 and the W3C recommendations for contrast of text. This will determine the foreground color
     * either being black or white depending on the luminance of the background. The background color must be provided
     * in hex. The actual threshold value has been adjusted for a better viewing experience while still maintaining
     * accessibility (I think).
     * @param backgroundHex the hex color of the background
     */
    static determineForegroundColor(backgroundHex: string) {
        const matches = backgroundHex.match(ColorUtilities.HEX_REGEX);

        if (matches === null) throw new Error(`Background hex was not of a valid hex format: ${backgroundHex}`);

        const color = matches[1];
        const rgb = [0, 0, 0];

        if (color.length === 3) {
            rgb[0] = parseInt(color[0], 16) / 255;
            rgb[1] = parseInt(color[1], 16) / 255;
            rgb[2] = parseInt(color[2], 16) / 255;
        } else {
            rgb[0] = parseInt(color.slice(0, 2), 16) / 255;
            rgb[1] = parseInt(color.slice(2, 4), 16) / 255;
            rgb[2] = parseInt(color.slice(4, 6), 16) / 255;
        }

        for (let i = 0; i < 3; i++) {
            if (rgb[i] < 0.03928) rgb[i] /= 12.92;
            else rgb[i] = ((rgb[i] + 0.055) / 1.055) ** 2.4;
        }

        const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];

        return luminance > 0.42912878474779202 ? '#000000' : '#ffffff';
    }
}

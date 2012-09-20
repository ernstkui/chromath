(function () {
/*
   Class: Chromath
*/
// Group: Constructors
/*
   Constructor: Chromath
   Create a new Chromath instance from a string or integer

   Parameters:
   mixed - The value to use for creating the color

   Returns:
   <Chromath> instance

   Properties:
   r - The red channel of the RGB representation of the Chromath. A number between 0 and 255.
   g - The green channel of the RGB representation of the Chromath. A number between 0 and 255.
   b - The blue channel of the RGB representation of the Chromath. A number between 0 and 255.
   a - The alpha channel of the Chromath. A number between 0 and 1.
   h - The hue of the Chromath. A number between 0 and 360.
   sl - The saturation of the HSL representation of the Chromath. A number between 0 and 1.
   sv - The saturation of the HSV/HSB representation of the Chromath. A number between 0 and 1.
   l - The lightness of the HSL representation of the Chromath. A number between 0 and 1.
   v - The lightness of the HSV/HSB representation of the Chromath. A number between 0 and 1.

   Examples:
  (start code)
// There are many ways to create a Chromath instance
new Chromath('#FF0000');                  // Hex (6 characters with hash)
new Chromath('FF0000');                   // Hex (6 characters without hash)
new Chromath('#F00');                     // Hex (3 characters with hash)
new Chromath('F00');                      // Hex (3 characters without hash)
new Chromath('red');                      // CSS/SVG Chromath name
new Chromath('rgb(255, 0, 0)');           // RGB via CSS
new Chromath({r: 255, g: 0, b: 0});       // RGB via object
new Chromath('rgba(255, 0, 0, 1)');       // RGBA via CSS
new Chromath({r: 255, g: 0, b: 0, a: 1}); // RGBA via object
new Chromath('hsl(0, 100%, 50%)');        // HSL via CSS
new Chromath({h: 0, s: 1, l: 0.5});       // HSL via object
new Chromath('hsla(0, 100%, 50%, 1)');    // HSLA via CSS
new Chromath({h: 0, s: 1, l: 0.5, a: 1}); // HSLA via object
new Chromath('hsv(0, 100%, 100%)');       // HSV via CSS
new Chromath({h: 0, s: 1, v: 1});         // HSV via object
new Chromath('hsva(0, 100%, 100%, 1)');   // HSVA via CSS
new Chromath({h: 0, s: 1, v: 1, a: 1});   // HSVA via object
new Chromath('hsb(0, 100%, 100%)');       // HSB via CSS
new Chromath({h: 0, s: 1, b: 1});         // HSB via object
new Chromath('hsba(0, 100%, 100%, 1)');   // HSBA via CSS
new Chromath({h: 0, s: 1, b: 1, a: 1});   // HSBA via object
new Chromath(16711680);                   // RGB via integer (alpha currently ignored)
(end code)
*/
function Chromath( mixed )
{
    var channels, color, hsl, hsv, rgb;

    if (isString(mixed) || isNumber(mixed)) {
        channels = Chromath.parse(mixed);
    } else if (isArray(mixed)){
        throw new Error('Unsure how to parse array `'+mixed+'`' +
                        ', please pass an object or CSS style ' +
                        'or try Chromath.rgb, Chromath.hsl, or Chromath.hsv'
                       );
    } else if (mixed instanceof Chromath) {
        channels = merge({}, mixed);
    } else if (isObject(mixed)){
        channels = merge({}, mixed);
    }

    if (! channels)
        throw new Error('Could not parse `'+mixed+'`');
    else if (!isFinite(channels.a))
        channels.a = 1;

    if ('r' in channels ){
        rgb = [channels.r, channels.g, channels.b];
        hsl = Chromath.rgb2hsl(rgb);
        hsv = Chromath.rgb2hsv(rgb);
    } else if ('h' in channels ){
        if ('l' in channels){
            hsl = [channels.h, channels.s, channels.l];
            rgb = Chromath.hsl2rgb(hsl);
            hsv = Chromath.rgb2hsv(rgb);
        } else if ('v' in channels || 'b' in channels) {
            if ('b' in channels) channels.v = channels.b;
            hsv = [channels.h, channels.s, channels.v];
            rgb = Chromath.hsv2rgb(hsv);
            hsl = Chromath.rgb2hsl(rgb);
        }
    }

    merge(this, {r: rgb[0],  g: rgb[1], b: rgb[2],
                 h: hsl[0], sl: hsl[1], l: hsl[2],
                 sv: hsv[1], v: hsv[2], a: channels.a
                });

    this.h = (((this.h % 360) + 360) % 360); // [0-360]
    if (this.sl > 1) this.sl /= 100;         // [0-1]
    if (this.sv > 1) this.sv /= 100;         // [0-1]
    if (this.l > 1) this.l /= 100;           // [0-1]

    this.r = clamp(parseInt(this.r, 10), 0, 255);
    this.g = clamp(parseInt(this.g, 10), 0 ,255);
    this.b = clamp(parseInt(this.b, 10), 0, 255);
    this.a = clamp(this.a, 0, 1);

    return this;
}

/*
  Constructor: Chromath.rgb
  Create a new <Chromath> instance from RGB values

  Parameters:
  r - Number, 0-255, representing the green channel OR Array OR object (with keys r,g,b) of RGB values
  g - Number, 0-255, representing the green channel
  b - Number, 0-255, representing the red channel
  a - (Optional) Float, 0-1, representing the alpha channel

 Returns:
 <Chromath>

 Examples:
 > > new Chromath.rgb(123, 234, 56).toString()
 > "#7BEA38"

 > > new Chromath.rgb([123, 234, 56]).toString()
 > "#7BEA38"

 > > new Chromath.rgb({r: 123, g: 234, b: 56}).toString()
 > "#7BEA38"
 */
Chromath.rgb = function (r, g, b, a)
{
    var rgba = args2rgb(r, g, b, a);
    r = rgba[0], g = rgba[1], b = rgba[2], a = rgba[3];

    return new Chromath({r: r, g: g, b: b, a: a});
};

/*
  Constructor: Chromath.rgba
  Alias for <Chromath.rgb>
*/
Chromath.rgba = Chromath.rgb;

/*
  Constructor: Chromath.hsl
  Create a new Chromath instance from HSL values

  Parameters:
  h - Number, -Infinity - Infinity, representing the hue OR Array OR object (with keys h,s,l) of HSL values
  s - Number, 0-1, representing the saturation
  l - Number, 0-1, representing the lightness
  a - (Optional) Float, 0-1, representing the alpha channel

  Returns:
  <Chromath>

  Examples:
  > > new Chromath.hsl(240, 1, 0.5).toString()
  > "#0000FF"

  > > new Chromath.hsl([240, 1, 0.5]).toString()
  > "#0000FF"

  > new Chromath.hsl({h:240, s:1, l:0.5}).toString()
  > "#0000FF"
 */
Chromath.hsl = function (h, s, l, a)
{
    var hsla = args2hsl(h, s, l, a);
    h = hsla[0], s = hsla[1], l = hsla[2], a = hsla[3];

    return new Chromath({h: h, s: s, l: l, a: a});
};

/*
  Constructor: Chromath.hsla
  Alias for <Chromath.hsl>
*/
Chromath.hsla = Chromath.hsl;

/*
  Constructor: Chromath.hsv
  Create a new Chromath instance from HSV values

  Parameters:
  h - Number, -Infinity - Infinity, representing the hue OR Array OR object (with keys h,s,l) of HSV values
  s - Number, 0-1, representing the saturation
  v - Number, 0-1, representing the lightness
  a - (Optional) Float, 0-1, representing the alpha channel

  Returns:
  <Chromath>

  Examples:
  > > new Chromath.hsv(240, 1, 1).toString()
  > "#0000FF"

  > > new Chromath.hsv([240, 1, 1]).toString()
  > "#0000FF"

  > > new Chromath.hsv({h:240, s:1, v:1}).toString()
  > "#0000FF"
 */
Chromath.hsv = function (h, s, v, a)
{
    var hsva = args2hsl(h, s, v, a);
    h = hsva[0], s = hsva[1], v = hsva[2], a = hsva[3];

    return new Chromath({h: h, s: s, v: v, a: a});
};

/*
  Constructor: Chromath.hsva
  Alias for <Chromath.hsv>
*/
Chromath.hsva = Chromath.hsv;

/*
  Constructor: Chromath.hsb
  Alias for <Chromath.hsv>
 */
Chromath.hsb = Chromath.hsv;

/*
   Constructor: Chromath.hsba
   Alias for <Chromath.hsva>
 */
Chromath.hsba = Chromath.hsva;

// Group: Static color representation methods
/*
  Method: Chromath.toInteger
  Convert a color into an integer (alpha channel currently omitted)

  Parameters:
  color - Accepts the same arguments as the Chromath constructor

  Returns:
  integer

  Examples:
  > > Chromath.toInteger('green');
  > 32768

  > > Chromath.toInteger('white');
  > 16777215
*/
Chromath.toInteger = function (color)
{
    var rgb = new Chromath(color).toRGBObject();

    return (rgb.b | rgb.g<<8 | rgb.r<<16);
};

/*
  Method: Chromath.toName
  Return the W3C color name of the color it matches

  Parameters:
  comparison

  Examples:
  > > Chromath.toName('rgb(255, 0, 255)');
  > 'fuchsia'

  > > Chromath.toName(65535);
  > 'aqua'
*/
Chromath.toName = function (comparison)
{
    comparison = +new Chromath(comparison);
    for (var color in Chromath.colors) if (+Chromath[color] == comparison) return color;
};

// Group: Static color conversion methods
/*
  Method: Chromath.rgb2hex
  Convert an RGB value to a Hex value

  Returns:
  string

  Example:
  > > Chromath.rgb2hex(50, 100, 150)
  > "#326496"
 */
Chromath.rgb2hex = function (r, g, b)
{
    var dec = Chromath.toInteger({r:r, g:g, b:b});
    var hex = dec.toString(16).toUpperCase();

    return '#' + lpad(hex, 6, 0);
};

// Converted from http://en.wikipedia.org/wiki/HSL_and_HSV#General_approach
/*
  Method: Chromath.rgb2hsl
  Convert RGB to HSL

  Parameters:
  r - Number, 0-255, representing the green channel OR Array OR object (with keys r,g,b) of RGB values
  g - Number, 0-255, representing the green channel
  b - Number, 0-255, representing the red channel

  Returns: array

  > > Chromath.rgb2hsl(0, 255, 0);
  > [ 120, 1, 0.5 ]

  > > Chromath.rgb2hsl([0, 0, 255]);
  > [ 240, 1, 0.5 ]

  > > Chromath.rgb2hsl({r: 255, g: 0, b: 0});
  > [ 0, 1, 0.5 ]
 */
Chromath.rgb2hsl = function (r, g, b)
{
    var rgb = rgbFraction(r, g, b);
    r = rgb[0], g = rgb[1], b = rgb[2];

    var M = Math.max(r, g, b);
    var m = Math.min(r, g, b);
    var C = M - m;
    var L = 0.5*(M + m);
    var S = (C === 0) ? 0 : C/(1-Math.abs(2*L-1));

    var h;
    if (C === 0) h = 0; // spec'd as undefined, but usually set to 0
    else if (M === r) h = ((g-b)/C) % 6;
    else if (M === g) h = ((b-r)/C) + 2;
    else if (M === b) h = ((r-g)/C) + 4;

    var H = 60 * h;

    return [H, parseFloat(S), parseFloat(L)];
};

/*
  Method: Chromath.rgb2hsv
  Convert RGB to HSV

  Parameters:
  r - Number, 0-255, representing the green channel OR Array OR object (with keys r,g,b) of RGB values
  g - Number, 0-255, representing the green channel
  b - Number, 0-255, representing the red channel

  Returns:
  Array

  > > Chromath.rgb2hsv(0, 255, 0);
  > [ 120, 1, 1 ]

  > > Chromath.rgb2hsv([0, 0, 255]);
  > [ 240, 1, 1 ]

  > > Chromath.rgb2hsv({r: 255, g: 0, b: 0});
  > [ 0, 1, 1 ]
 */
Chromath.rgb2hsv = function (r, g, b)
{
    var rgb = rgbFraction(r, g, b);
    r = rgb[0], g = rgb[1], b = rgb[2];

    var M = Math.max(r, g, b);
    var m = Math.min(r, g, b);
    var C = M - m;
    var L = M;
    var S = (C === 0) ? 0 : C/M;

    var h;
    if (C === 0) h = 0; // spec'd as undefined, but usually set to 0
    else if (M === r) h = ((g-b)/C) % 6;
    else if (M === g) h = ((b-r)/C) + 2;
    else if (M === b) h = ((r-g)/C) + 4;

    var H = 60 * h;

    return [H, parseFloat(S), parseFloat(L)];
};

/*
   Method: Chromath.rgb2hsb
   Alias for <Chromath.rgb2hsv>
 */
Chromath.rgb2hsb = Chromath.rgb2hsv;

/*
  Method: Chromath.hsl2rgb
  Convert from HSL to RGB

  Parameters:
  h - Number, -Infinity - Infinity, representing the hue OR Array OR object (with keys h,s,l) of HSL values
  s - Number, 0-1, representing the saturation
  l - Number, 0-1, representing the lightness

  Returns:
  array

  Examples:
  > > Chromath.hsl2rgb(360, 1, 0.5);
  > [ 255, 0, 0 ]

  > > Chromath.hsl2rgb([0, 1, 0.5]);
  > [ 255, 0, 0 ]

  > > Chromath.hsl2rgb({h: 210, s:1, v: 0.5});
  > [ 0, 127.5, 255 ]
 */
// TODO: Can I %= hp and then do a switch?
Chromath.hsl2rgb = function (h, s, l)
{
    var hsl = hslFraction(h, s, l);
    h=hsl[0], s=hsl[1], l=hsl[2];

    var C = (1 - Math.abs(2*l-1)) * s;
    var hp = h/60;
    var X = C * (1-Math.abs(hp%2-1));
    var rgb, m;

    switch (Math.floor(hp)){
    case 0:  rgb = [C,X,0]; break;
    case 1:  rgb = [X,C,0]; break;
    case 2:  rgb = [0,C,X]; break;
    case 3:  rgb = [0,X,C]; break;
    case 4:  rgb = [X,0,C]; break;
    case 5:  rgb = [C,0,X]; break;
    default: rgb = [0,0,0];
    }

    m = l - (C/2);

    return [
        (rgb[0]+m)*255,
        (rgb[1]+m)*255,
        (rgb[2]+m)*255
    ];
};

/*
  Method: Chromath.hsv2rgb
  Convert HSV to RGB

  Parameters:
  h - Number, -Infinity - Infinity, representing the hue OR Array OR object (with keys h,s,v or h,s,b) of HSV values
  s - Number, 0-1, representing the saturation
  v - Number, 0-1, representing the lightness

  Examples:
  > > Chromath.hsv2rgb(360, 1, 1);
  > [ 255, 0, 0 ]

  > > Chromath.hsv2rgb([0, 1, 0.5]);
  > [ 127.5, 0, 0 ]

  > > Chromath.hsv2rgb({h: 210, s: 0.5, v: 1});
  > [ 127.5, 191.25, 255 ]
 */
Chromath.hsv2rgb = function (h, s, v)
{
    var hsv = hslFraction(h, s, v);
    h=hsv[0], s=hsv[1], v=hsv[2];

    var C = v * s;
    var hp = h/60;
    var X = C*(1-Math.abs(hp%2-1));
    var rgb, m;

    if (h == undefined) rgb = [0,0,0]
    else if (0 <= hp && hp < 1) rgb = [C,X,0];
    else if (1 <= hp && hp < 2) rgb = [X,C,0];
    else if (2 <= hp && hp < 3) rgb = [0,C,X];
    else if (3 <= hp && hp < 4) rgb = [0,X,C];
    else if (4 <= hp && hp < 5) rgb = [X,0,C];
    else if (5 <= hp && hp < 6) rgb = [C,0,X];

    m = v - C;

    return [
        (rgb[0]+m)*255,
        (rgb[1]+m)*255,
        (rgb[2]+m)*255
    ];
};

/*
   Method: Chromath.hsb2rgb
   Alias for <Chromath.hsv2rgb>
 */
Chromath.hsb2rgb = Chromath.hsv2rgb;

/* Group: Static color scheme methods */
/*
  Method: Chromath.complement
  Return the complement of the given color

  Returns: <Chromath>

  > > Chromath.complement(new Chromath('red'));
  > { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 }

  > > Chromath.complement(new Chromath('red')).toString();
  > '#00FFFF'
 */
Chromath.complement = function (color)
{
    var c = new Chromath(color);
    var hsl = c.toHSLObject();

    hsl.h = (hsl.h + 180) % 360;

    return new Chromath(hsl);
};

/*
  Method: Chromath.triad
  Create a triad color scheme from the given Chromath.

  Examples:
  > > Chromath.triad(Chromath.yellow)
  > [ { r: 255, g: 255, b: 0, a: 1, h: 60, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 255, g: 0, b: 255, a: 1, h: 300, sl: 1, sv: 1, l: 0.5, v: 1 } ]

 > > Chromath.triad(Chromath.yellow).toString();
 > '#FFFF00,#00FFFF,#FF00FF'
*/
Chromath.triad = function (color)
{
    var c = new Chromath(color);

    return [
        c,
        new Chromath({r: c.b, g: c.r, b: c.g}),
        new Chromath({r: c.g, g: c.b, b: c.r})
    ];
};

/*
  Method: Chromath.tetrad
  Create a tetrad color scheme from the given Chromath.

  Examples:
  > > Chromath.tetrad(Chromath.cyan)
  > [ { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 255, g: 0, b: 255, a: 1, h: 300, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 255, g: 255, b: 0, a: 1, h: 60, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 0, a: 1, h: 120, sl: 1, sv: 1, l: 0.5, v: 1 } ]

  > > Chromath.tetrad(Chromath.cyan).toString();
  > '#00FFFF,#FF00FF,#FFFF00,#00FF00'
*/
Chromath.tetrad = function (color)
{
    var c = new Chromath(color);

    return [
        c,
        new Chromath({r: c.b, g: c.r, b: c.b}),
        new Chromath({r: c.b, g: c.g, b: c.r}),
        new Chromath({r: c.r, g: c.b, b: c.r})
    ];
};

/*
  Method: Chromath.analogous
  Find analogous colors from a given color

  Parameters:
  mixed - Any argument which is passed to <Chromath>
  results - default = 8
  slices - default = 30

  Examples:
  > > Chromath.analogous(new Chromath('rgb(0, 255, 255)'))
  > [ { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 101, a: 1, h: 144, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 153, a: 1, h: 156, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 203, a: 1, h: 168, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 255, b: 255, a: 1, h: 180, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 203, b: 255, a: 1, h: 192, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 153, b: 255, a: 1, h: 204, sl: 1, sv: 1, l: 0.5, v: 1 },
  >   { r: 0, g: 101, b: 255, a: 1, h: 216, sl: 1, sv: 1, l: 0.5, v: 1 } ]

  > > Chromath.analogous(new Chromath('rgb(0, 255, 255)')).toString()
  > '#00FFFF,#00FF65,#00FF99,#00FFCB,#00FFFF,#00CBFF,#0099FF,#0065FF'
 */
Chromath.analogous = function (color, results, slices)
{
    if (!isFinite(results)) results = 8;
    if (!isFinite(slices)) slices = 30;

    var c = new Chromath(color);
    var hsv = c.toHSVObject();
    var slice = 360 / slices;
    var ret = [ c ];

    hsv.h = ((hsv.h - (slice * results >> 1)) + 720) % 360;
    while (--results) {
        hsv.h += slice;
        hsv.h %= 360;
        ret.push(new Chromath(hsv));
    }

    return ret;
};

/*
  Method: Chromath.monochromatic
  Return a series of the given color at various lightnesses

  Examples:
  > > Chromath.monochromatic('rgb(0, 100, 255)').forEach(function (c){ console.log(c.toHSVString()); })
  > hsv(216,100%,20%)
  > hsv(216,100%,40%)
  > hsv(216,100%,60%)
  > hsv(216,100%,80%)
  > hsv(216,100%,100%)
*/
Chromath.monochromatic = function (color, results)
{
    if (!results) results = 5;

    var c = new Chromath(color);
    var hsv = c.toHSVObject();
    var inc = 1 / results;
    var ret = [], step = 0;

    while (step++ < results) {
        hsv.v = step * inc;
        ret.push(new Chromath(hsv));
    }

    return ret;
};

/*
  Method: Chromath.splitcomplement
  Generate a split complement color scheme from the given color

  Examples:
  > > Chromath.splitcomplement('rgb(0, 100, 255)')
  > [ { r: 0, g: 100, b: 255, h: 216.47058823529414, sl: 1, l: 0.5, sv: 1, v: 1, a: 1 },
  >   { r: 255, g: 183, b: 0, h: 43.19999999999999, sl: 1, l: 0.5, sv: 1, v: 1, a: 1 },
  >   { r: 255, g: 73, b: 0, h: 17.279999999999973, sl: 1, l: 0.5, sv: 1, v: 1, a: 1 } ]

  > > Chromath.splitcomplement('rgb(0, 100, 255)').toString()
  > '#0064FF,#FFB700,#FF4900'
 */
Chromath.splitcomplement = function (color)
{
    var c = new Chromath(color);
    var hsv = c.toHSVObject();
    var ret = [ c ];

    hsv.h *= 0.2;
    hsv.h %= 360;
    ret.push(new Chromath(hsv));

    hsv.h *= 0.4;
    hsv.h %= 360;
    ret.push(new Chromath(hsv));

    return ret;
};

//Group: Static SOMETHING color methods
/*
  Method: Chromath.towards
  Move from one color towards another by the given percentage (0-1, 0-100)

  Parameters:
  from - The starting color
  to - The destination color
  by - The percentage, expressed as a floating number between 0 and 1, to move towards the destination color

  > > Chromath.towards('red', 'yellow', 0.5).toString()
  > "#FF7F00"
*/
Chromath.towards = function (from, to, by)
{
    if (!to) { return from; }
    if (!isFinite(by))
        throw new Error('TypeError: `by`(' + by  +') should be between 0 and 1');
    if (!(from instanceof Chromath)) from = new Chromath(from);
    if (!(to instanceof Chromath)) to = new Chromath(to || '#FFFFFF');
    by = parseFloat(by);

    return new Chromath({
        r: lerp(from.r, to.r, by),
        g: lerp(from.g, to.g, by),
        b: lerp(from.b, to.b, by),
        a: lerp(from.a, to.a, by)
    });
};

/*
  Method: Chromath.gradient
  Create an array of Chromath objects

  Parameters:
  from - The beginning color of the gradient
  to - The end color of the gradient
  slices - The number of colors in the array
  slice - The color at a specific, 1-based, slice index

  Examples:
  > > Chromath.gradient('red', 'yellow').length;
  > 20

  > > Chromath.gradient('red', 'yellow', 5).toString();
  > "#FF0000,#FF3F00,#FF7F00,#FFBF00,#FFFF00"

  > > Chromath.gradient('red', 'yellow', 5, 2).toString();
  > "#FF7F00"

  > > Chromath.gradient('red', 'yellow', 5)[2].toString();
  > "#FF7F00"
 */
Chromath.gradient = function (from, to, slices, slice)
{
    var gradient = [], stops;

    if (! slices) slices = 20;
    stops = (slices-1);

    if (isFinite(slice)) return Chromath.towards(from, to, slice/stops);
    else slice = -1;

    while (++slice < slices){
        gradient.push(Chromath.towards(from, to, slice/stops))
    }

    return gradient;
};

/*
  Method: Chromath.tint
  Lighten a color by adding a percentage of white to it

  Returns <Chromath>

  > > Chromath.lighten('rgb(0, 100, 255)', 0.5).toRGBString();
  > 'rgb(127,177,255)'
*/
Chromath.tint = function ( from, by )
{
    return Chromath.towards( from, '#FFFFFF', by );
};

/*
   Method: Chromath.lighten
   Alias for <Chromath.tint>
*/
Chromath.lighten = Chromath.tint;

/*
  Method: Chromath.shade
  Darken a color by adding a percentage of black to it

  Example:
  > > Chromath.darken('rgb(0, 100, 255)', 0.5).toRGBString();
  > 'rgb(0,50,127)'
 */
Chromath.shade = function ( from, by )
{
    return Chromath.towards( from, '#000000', by );
};

/*
   Method: Chromath.darken
   Alias for <Chromath.shade>
 */
Chromath.darken = Chromath.shade;

/*
  Method: Chromath.additive
  Combine any number colors using additive color

  Examples:
  > > Chromath.additive('#F00', '#0F0').toString();
  > '#FFFF00'

  > > Chromath.additive('#F00', '#0F0').toString() == Chromath.yellow.toString();
  > true

  > > Chromath.additive('red', '#0F0', 'rgb(0, 0, 255)').toString() == Chromath.white.toString();
  > true
 */
Chromath.additive = function ()
{
    var args = arguments.length-2, i=-1, a, b;
    while (i++ < args){

        a = a || new Chromath(arguments[i]);
        b = new Chromath(arguments[i+1]);

        if ((a.r += b.r) > 255) a.r = 255;
        if ((a.g += b.g) > 255) a.g = 255;
        if ((a.b += b.b) > 255) a.b = 255;

        a = new Chromath(a);
    }

    return a;
};

/*
  Method: Chromath.subtractive
  Combine any number of colors using subtractive color

  Examples:
  > > Chromath.subtractive('yellow', 'magenta').toString();
  > '#FF0000'

  > > Chromath.subtractive('yellow', 'magenta').toString() === Chromath.red.toString();
  > true

  > > Chromath.subtractive('cyan', 'magenta', 'yellow').toString();
  > '#000000'

  > > Chromath.subtractive('red', '#0F0', 'rgb(0, 0, 255)').toString();
  > '#000000'
*/
Chromath.subtractive = function ()
{
    var args = arguments.length-2, i=-1, a, b;
    while (i++ < args){

        a = a || new Chromath(arguments[i]);
        b = new Chromath(arguments[i+1]);

        if ((a.r += b.r - 255) < 0) a.r = 0;
        if ((a.g += b.g - 255) < 0) a.g = 0;
        if ((a.b += b.b - 255) < 0) a.b = 0;

        a = new Chromath(a);
    }

    return a;
};

/*
  Method: Chromath.multiply
  Multiply any number of colors

  Examples:
  > > Chromath.multiply(Chromath.lightgoldenrodyellow, Chromath.lightblue).toString();
  > "#A9D3BD"

  > > Chromath.multiply(Chromath.oldlace, Chromath.lightblue, Chromath.darkblue).toString();
  > "#000070"
*/
Chromath.multiply = function ()
{
    var args = arguments.length-2, i=-1, a, b;
    while (i++ < args){

        a = a || new Chromath(arguments[i]);
        b = new Chromath(arguments[i+1]);

        a.r = (a.r / 255 * b.r)|0;
        a.g = (a.g / 255 * b.g)|0;
        a.b = (a.b / 255 * b.b)|0;

        a = new Chromath(a);
    }

    return a;
};

/*
  Method: Chromath.average
  Averages any number of colors

  Examples:
  > > Chromath.average(Chromath.lightgoldenrodyellow, Chromath.lightblue).toString()
  > "#D3E9DC"

  > > Chromath.average(Chromath.oldlace, Chromath.lightblue, Chromath.darkblue).toString()
  > "#6A73B8"
 */
Chromath.average = function ()
{
    var args = arguments.length-2, i=-1, a, b;
    while (i++ < args){

        a = a || new Chromath(arguments[i]);
        b = new Chromath(arguments[i+1]);

        a.r = (a.r + b.r) >> 1;
        a.g = (a.g + b.g) >> 1;
        a.b = (a.b + b.b) >> 1;

        a = new Chromath(a);
    }

    return a;
};

/*
  Method: Chromath.desaturate
  Desaturate a color using any of 3 approaches

  Parameters:
  color - any argument accepted by the <Chromath> constructor
  formula - The formula to use (from <xarg's greyfilter at http://www.xarg.org/project/jquery-color-plugin-xcolor>)
  - 1 - xarg's own formula
  - 2 - Sun's formula: (1 - avg) / (100 / 35) + avg)
  - empty - The oft-seen 30% red, 59% green, 11% blue formula

  Examples:
  > > Chromath.desaturate('red').toString()
  > "#4C4C4C"

  > > Chromath.desaturate('red', 1).toString()
  > "#373737"

  > > Chromath.desaturate('red', 2).toString()
  > "#909090"
*/
Chromath.desaturate = function (color, formula)
{
    var c = new Chromath(color), rgb, avg;

    switch (formula) {
    case 1: // xarg's formula
        avg = .35 + 13 * (c.r + c.g + c.b) / 60; break;
    case 2: // Sun's formula: (1 - avg) / (100 / 35) + avg)
        avg = (13 * (c.r + c.g + c.b) + 5355) / 60; break;
    default:
        avg = c.r * .3 + c.g * .59 + c.b * .11;
    }

    avg = clamp(avg, 0, 255);
    rgb = {r: avg, g: avg, b: avg};

    return new Chromath(rgb);
};

/*
  Method: Chromath.greyscale
  Alias for <Chromath.desaturate>
*/
Chromath.greyscale = Chromath.desaturate;

/*
  Method: Chromath.overlay
  Add one color on top of another with a given transparency

  Examples:
  > > Chromath.average(Chromath.lightgoldenrodyellow, Chromath.lightblue).toString()
  > "#D3E9DC"

  > > Chromath.average(Chromath.oldlace, Chromath.lightblue, Chromath.darkblue).toString()
  > "#6A73B8"
 */
Chromath.overlay = function (top, bottom, opacity)
{
    var a = new Chromath(top);
    var b = new Chromath(bottom);

    if (opacity > 1) opacity /= 100;
    opacity = clamp(opacity - 1 + b.a, 0, 1);

    return new Chromath({r: lerp(a.r, b.r, opacity),
                      g: lerp(a.g, b.g, opacity),
                      b: lerp(a.b, b.b, opacity)});
};

/*
  Method: Chromath.websafe
  Convert a color to one of the 216 "websafe" colors

  Examples:
  > > Chromath.websafe('#ABCDEF').toString()
  > '#99CCFF'

  > > Chromath.websafe('#BBCDEF').toString()
  > '#CCCCFF'
 */
Chromath.websafe = function (color)
{
    color = new Chromath(color);

    color.r = Math.round(color.r / 51) * 51;
    color.g = Math.round(color.g / 51) * 51;
    color.b = Math.round(color.b / 51) * 51;

    return new Chromath(color);
};

// Group: Instance representation methods
Chromath.prototype = {
    /*
       Method: toName
       Call <Chromath.toName> on the current instance
       > > var color = new Chromath('rgb(173, 216, 230)');
       > > color.toName();
       > "lightblue"
    */
    toName: function (){ return Chromath.toName(this); },

    /*
       Method: toString
       Display the instance as a string. Defaults to <Chromath.toHexString>
       > > var color = Chromath.rgb(56, 78, 90);
       > > Color.toHexString();
       > "#384E5A"
    */
    toString: function (){ return this.toHexString(); },

    /*
       Method: valueOf
       Display the instance as an integer. Defaults to <Chromath.toInteger>
       > > var yellow = new Chromath('yellow');
       > > yellow.valueOf();
       > 16776960
       > > +yellow
       > 16776960
    */
    valueOf: function (){ return Chromath.toInteger(this); },

  /*
     Method: rgb
     Return the RGB array of the instance
     > > new Chromath('red').rgb();
     > [255, 0, 0]
  */
    rgb: function (){ return this.toRGBArray(); },

    /*
       Method: toRGBArray
       Return the RGB array of the instance
       > > Chromath.burlywood.toRGBArray();
       > [255, 184, 135]
    */
    toRGBArray: function (){ return this.toRGBAArray().slice(0,3); },

    /*
       Method: toRGBObject
       Return the RGB object of the instance
       > > new Chromath('burlywood').toRGBObject();
       > {r: 255, g: 184, b: 135}
    */
    toRGBObject: function ()
    {
        var rgb = this.toRGBArray();

        return {r: rgb[0], g: rgb[1], b: rgb[2]};
    },

    /*
       Method: toRGBString
       Return the RGB string of the instance
       > > new Chromath('aliceblue').toRGBString();
       > "rgb(240,248,255)"
    */
    toRGBString: function ()
    {
        return "rgb("+ this.toRGBArray().join(",") +")";
    },

    /*
       Method: rgba
       Return the RGBA array of the instance
       > > new Chromath('red').rgba();
       > [255, 0, 0, 1]
    */
    rgba: function (){ return this.toRGBAArray(); },

    /*
       Method: toRGBAArray
       Return the RGBA array of the instance
       > > Chromath.lime.toRGBAArray();
       > [0, 255, 0, 1]
    */
    toRGBAArray: function ()
    {
        var rgba = [Math.round(this.r),
                    Math.round(this.g),
                    Math.round(this.b),
                    parseFloat(this.a)];

        return rgba;
    },

    /*
       Method: toRGBAObject
       Return the RGBA object of the instance
       > > Chromath.cadetblue.toRGBAObject();
       > {r: 95, g: 158, b: 160}
    */
    toRGBAObject: function ()
    {
        var rgba = this.toRGBAArray();

        return {r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3]};
    },

    /*
       Method: toRGBAString
       Return the RGBA string of the instance
       > > new Chromath('darkblue').toRGBAString();
       > "rgba(0,0,139,1)"
    */
    toRGBAString: function (){
        return "rgba("+ this.toRGBAArray().join(",") +")";
    },

    /*
       Method: hex
       Return the hex array of the instance
       > new Chromath('darkgreen').hex()
       [ '00', '64', '00' ]
    */
    hex: function (){ return this.toHexArray(); },

    /*
      Method: toHexArray
       Return the hex array of the instance
      > > Chromath.firebrick.toHexArray();
      > ["B2", "22", "22"]
    */
    toHexArray: function (){
        return this.toHexString().slice(1).match(/([\dA-F]{2})/ig);
    },

    /*
       Method: toHexObject
       Return the hex object of the instance
       > > Chromath.gainsboro.toHexObject();
       > {r: "DC", g: "DC", b: "DC"}
    */
    toHexObject: function ()
    {
        var hex = this.toHexArray();

        return { r: hex[0], g: hex[1], b: hex[2] };
    },

    /*
      Method: toHexString
       Return the hex string of the instance
      > > Chromath.honeydew.toHexString();
      > "#F0FFF0"
    */
    toHexString: function (){
        return Chromath.rgb2hex(this.r, this.g, this.b);
    },

    /*
       Method: hsl
       Return the HSL array of the instance
       > >new Chromath('green').hsl();
       > [120, 1, 0.25098039215686274]
    */
    hsl: function (){ return this.toHSLArray(); },

    /*
       Method: toHSLArray
       Return the HSL array of the instance
       > > new Chromath('red').toHSLArray();
       > [0, 1, 0.5]
    */
    toHSLArray: function (){
        return this.toHSLAArray().slice(0,3);
    },

    /*
       Method: toHSLObject
       Return the HSL object of the instance
       > > new Chromath('red').toHSLObject();
       [h:0, s:1, l:0.5]
    */
    toHSLObject: function ()
    {
        var hsl = this.toHSLArray();

        return {h: hsl[0], s: hsl[1], l: hsl[2]};
    },

    /*
       Method: toHSLString
       Return the HSL string of the instance
       > > new Chromath('red').toHSLString();
       > "hsl(0,1,0.5)"
    */
    toHSLString: function (){
        return 'hsl('+ this.toHSLArray().join(',') +')';
    },

    /*
      Method: hsla
      Return the HSLA array of the instance
      > > new Chromath('green').hsla();
      > [120, 1, 0.25098039215686274, 1]
    */
    hsla: function (){ return this.toHSLAArray(); },

    /*
       Method: toHSLArray
       Return the HSLA array of the instance
       > > Chromath.antiquewhite.toHSLAArray();
       > [34, 0.7777777777777773, 0.9117647058823529, 1]
    */
    toHSLAArray: function ()
    {
        return [Math.round(this.h),
                parseFloat(this.sl),
                parseFloat(this.l),
                parseFloat(this.a)];
    },

    /*
       Method: toHSLAObject
       Return the HSLA object of the instance
       > > Chromath.antiquewhite.toHSLAArray();
       > {h:34, s:0.7777777777777773, l:0.9117647058823529, a:1}
    */
    toHSLAObject: function ()
    {
        var hsla = this.toHSLArray();

        return {h: hsla[0], s: hsla[1], l: hsla[2], a: hsla[3]};
    },

    /*
       Method: toHSLAString
       Return the HSLA string of the instance
       > > Chromath.antiquewhite.toHSLAString();
       > "hsla(34,0.7777777777777773,0.9117647058823529,1)"
    */
    toHSLAString: function (){
        return 'hsla('+ this.toHSLAArray().join(',') +')';
    },

    /*
       Method: hsv
       Return the HSV array of the instance
       > > new Chromath('blue').hsv();
       > [240, 1, 1]
    */
    hsv: function (){ return this.toHSVArray(); },

    /*
       Method: toHSVArray
       Return the HSV array of the instance
       > > new Chromath('navajowhite').toHSVArray();
       > [36, 0.32156862745098036, 1]
    */
    toHSVArray: function ()
    {
        return [Math.round(this.h),
                parseFloat(this.sv),
                parseFloat(this.v)];
    },

    /*
       Method: toHSVObject
       Return the HSV object of the instance
       > > new Chromath('navajowhite').toHSVObject();
       > {h36, s:0.32156862745098036, v:1}
    */
    toHSVObject: function ()
    {
        return {h: Math.round(this.h),
                s: parseFloat(this.sv),
                v: parseFloat(this.v)};
    },

    /*
       Method: toHSVString
       Return the HSV string of the instance
       > > new Chromath('navajowhite').toHSVString();
       > "hsv(36,32.15686274509804%,100%)"
    */
    toHSVString: function ()
    {
        var hsv = this.toHSVArray();
        var vals = [hsv[0], hsv[1]*100+'%', hsv[2]*100+'%'];

        return 'hsv('+ vals +')';
    },

    /*
       Method: hsva
       Return the HSVA array of the instance
       > > new Chromath('blue').hsva();
       > [240, 1, 1, 1]
    */
    hsva: function (){ return this.toHSVAArray(); },

    /*
       Method: toHSVAArray
       Return the HSVA array of the instance
       > > new Chromath('olive').toHSVAArray();
       > [60, 1, 0.5019607843137255, 1]
    */
    toHSVAArray: function (){
        return [Math.round(this.h),
                parseFloat(this.sv),
                parseFloat(this.v),
                parseFloat(this.a)];
    },

    /*
       Method: toHSVAObject
       Return the HSVA object of the instance
       > > new Chromath('olive').toHSVAArray();
       > {h:60, s: 1, v:0.5019607843137255, a:1}
    */
    toHSVAObject: function (){
        var hsva = this.toHSVAArray();

        return {h: hsva[0], s: hsva[1], l: hsva[2], a: hsva[3]};
    },

    /*
       Method: toHSVAString
       Return the HSVA string of the instance
       > > new Chromath('olive').toHSVAString();
       > "hsva(60,100%,50.19607843137255%,1)"
    */
    toHSVAString: function ()
    {
        var hsva = this.toHSVAArray();
        var vals = [hsva[0], hsva[1]*100+'%', hsva[2]*100+'%', hsva[3]];

        return 'hsva('+ vals +')';
    },

    /*
       Method: hsb
       Alias for <hsv>
    */
    hsb: function (){ return this.hsv(); },

    /*
       Method: toHSBArray
       Alias for <toHSBArray>
    */
    toHSBArray: function ()
    {
        return this.toHSVArray();
    },

    /*
       Method: toHSBObject
       Alias for <toHSVObject>
    */
    toHSBObject: function ()
    {
        return this.toHSVObject();
    },

    /*
       Method: toHSBString
       Alias for <toHSVString>
    */
    toHSBString: function ()
    {
        return this.toHSVString();
    },

    /*
       Method: hsba
       Alias for <hsva>
    */
    hsba: function (){ return this.hsva(); },

    /*
       Method: toHSBAArray
       Alias for <toHSVAArray>
    */
    toHSBAArray: function (){
        return this.toHSVAArray();
    },

    /*
       Method: toHSBAObject
       Alias for <toHSVAObject>
    */
    toHSBAObject: function (){
        return this.toHSVAObject();
    },

    /*
       Method: toHSBAString
       Alias for <toHSVAString>
    */
    toHSBAString: function ()
    {
        return this.toHSVAString();
    },

    //Group: Instance color scheme methods
    /*
       Method: complement
       Calls <Chromath.complement> with the current instance as the first parameter

       > > Chromath.red.complement().rgb();
       > [0, 255, 255]
    */
    complement: function (){
        return Chromath.complement(this);
    },

    /*
       Method: triad
       Calls <Chromath.triad> with the current instance as the first parameter

       > > new Chromath('hsl(0, 100%, 50%)').triad().toString();
       > "#FF0000,#00FF00,#0000FF"
    */
    triad: function (){
        return Chromath.triad(this);
    },

    /*
       Method: tetrad
       Calls <Chromath.tetrad> with the current instance as the first parameter

       > > Chromath.hsb(240, 1, 1).triad();
       > [Chromath, Chromath, Chromath]
    */
    tetrad: function (){
        return Chromath.tetrad(this);
    },

    /*
       Method: analogous
       Calls <Chromath.analogous> with the current instance as the first parameter

       > > Chromath.hsb(120, 1, 1).analogous();
       > [Chromath, Chromath, Chromath, Chromath, Chromath, Chromath, Chromath, Chromath]

       > > Chromath.hsb(180, 1, 1).analogous(5).toString();
       > "#00FFFF,#00FFB2,#00FFE5,#00E5FF,#00B2FF"

       > > Chromath.hsb(180, 1, 1).analogous(5, 10).toString();
       > "#00FFFF,#00FF19,#00FFB2,#00B2FF,#0019FF"
    */
    analogous: function (results, slices){
        return Chromath.analogous(this, results, slices);
    },

    /*
      Method: monochromatic
       Calls <Chromath.monochromatic> with the current instance as the first parameter

      > > Chromath.blue.monochromatic().toString();
      > "#000033,#000066,#000099,#0000CC,#0000FF"
    */
    monochromatic: function (results){
        return Chromath.monochromatic(this, results);
    },

    /*
       Method: splitcomplement
       Calls <Chromath.splitcomplement> with the current instance as the first parameter

       > > Chromath.blue.splitcomplement().toString();
       > "#0000FF,#FFCC00,#FF5100"
    */
    splitcomplement: function (){
        return Chromath.splitcomplement(this);
    },

    // Group: Instance SOMETHING methods
    /*
       Method: clone
       Return an independent copy of the instance
    */
    clone: function (){
        return new Chromath(this);
    },

    /*
       Method: towards
       Calls <Chromath.towards> with the current instance as the first parameter

       > > var red = new Chromath('red');
       > > red.towards('yellow', 0.55).toString();
       > "#FF8C00"
    */
    towards: function (to, by) {
        return Chromath.towards(this, to, by);
    },

    /*
       Method: tint
       Calls <Chromath.tint> with the current instance as the first parameter

       > > new Chromath('yellow').tint(0.25).toString();
       > "#FFFF3F"
    */
    tint: function (by) {
        return Chromath.tint(this, by);
    },

    /*
      Method: shade
       Calls <Chromath.shade> with the current instance as the first parameter

      > > new Chromath('yellow').shade(0.25).toString();
      > "#BFBF00"
    */
    shade: function (by) {
        return Chromath.shade(this, by);
    },

    /*
       Method: additive
       Calls <Chromath.additive> with the current instance as the first parameter

       > > new Chromath('red').additive('#00FF00', 'blue').toString();
       > "#FFFFFF"
    */
    additive: function (){
        var arr = Array.prototype.slice.call(arguments);
        return Chromath.additive.apply(Chromath, [this].concat(arr));
    },

    /*
       Method: subtractive
       Calls <Chromath.subtractive> with the current instance as the first parameter

       > > new Chromath('cyan').subtractive('magenta', 'yellow').toString();
       > "#000000"
    */
    subtractive: function (){
        var arr = Array.prototype.slice.call(arguments);
        return Chromath.subtractive.apply(Chromath, [this].concat(arr));
    },

    /*
       Method: multiply
       Calls <Chromath.multiply> with the current instance as the first parameter

       > > Chromath.lightcyan.multiply(Chromath.brown).toString();
       > "#902A2A"
    */
    multiply: function (){
        var arr = Array.prototype.slice.call(arguments);
        return Chromath.multiply.apply(Chromath, [this].concat(arr));
    },

    /*
       Method: average
       Calls <Chromath.average> with the current instance as the first parameter

       > > Chromath.black.average('white').rgb();
       > [127, 127, 127]
    */
    average: function (){
        var arr = Array.prototype.slice.call(arguments);
        return Chromath.average.apply(Chromath, [this].concat(arr));
    },

    /*
       Method: desaturate
       Calls <Chromath.desaturate> with the current instance as the first parameter

     > > new Chromath('orange').desaturate().toString();
     > "#ADADAD"

     > > new Chromath('orange').desaturate(1).toString();
     > "#5B5B5B"

     > > new Chromath('orange').desaturate(2).toString();
     > "#B4B4B4"
     */
    desaturate: function (formula){
        return Chromath.desaturate(this, formula);
    },

    /*
       Method: overlay
       Calls <Chromath.overlay> with the current instance as the first parameter

     > > Chromath.red.overlay('green', 0.4).toString();
     > "#993300"

     > > Chromath.red.overlay('green', 1).toString();
     > "#008000"

     > > Chromath.red.overlay('green', 0).toString();
     > "#FF0000"
     */
    overlay: function (bottom, transparency){
        return Chromath.overlay(this, bottom, transparency);
    },

    /*
       Method: websafe
       Calls <Chromath.websafe> with the current instance as the first parameter

       > > Chromath.rgb(123, 234, 56).toString();
       > "#7BEA38"

       > Chromath.rgb(123, 234, 56).websafe().toString();
       > "#66FF33"
     */
    websafe: function (){
        return Chromath.websafe(this);
    },

    /*
       Method: gradient
       Calls <Chromath.gradient> with the current instance as the first parameter

       > > new Chromath('#F00').gradient('#00F').toString()
       > "#FF0000,#F1000D,#E4001A,#D60028,#C90035,#BB0043,#AE0050,#A1005D,#93006B,#860078,#780086,#6B0093,#5D00A1,#5000AE,#4300BB,#3500C9,#2800D6,#1A00E4,#0D00F1,#0000FF"

       > > new Chromath('#F00').gradient('#00F', 5).toString()
       > "#FF0000,#BF003F,#7F007F,#3F00BF,#0000FF"

       > > new Chromath('#F00').gradient('#00F', 5, 3).toString()
       > "#3F00BF"
    */
    gradient: function (to, slices, slice){
        return Chromath.gradient(this, to, slices, slice);
    }
};

// Group: Static properties
/*
  Property: Chromath.parsers
   An array of objects for attempting to convert a string describing a color into an object containing the various channels. No user action is required but parsers can be

   Object properties:
   regex - regular expression used to test the string or numeric input
   process - function which is passed the results of `regex.match` and returns an object with either the rgb, hsl, hsv, or hsb channels of the Chromath.

   Examples:
(start code)
// Add a parser
Chromath.parsers.push({
    example: [3554431, 16809984],
    regex: /^\d+$/,
    process: function (color){
        return {
            r: color >> 16 & 255,
            g: color >> 8 & 255,
            b: color & 255
        };
    }
});
(end code)
(start code)
// Override entirely
Chromath.parsers = [
   {
       example: [3554431, 16809984],
       regex: /^\d+$/,
       process: function (color){
           return {
               r: color >> 16 & 255,
               g: color >> 8 & 255,
               b: color & 255
           };
       }
   },

   {
       example: ['#fb0', 'f0f'],
       regex: /^#?([\dA-F]{1})([\dA-F]{1})([\dA-F]{1})$/i,
       process: function (hex, r, g, b){
           return {
               r: parseInt(r + r, 16),
               g: parseInt(g + g, 16),
               b: parseInt(b + b, 16)
           };
       }
   }
(end code)
 */
Chromath.parsers = [
    {
        example: ['red', 'burlywood'],
        regex: /^[a-z]+$/i,
        process: function (name){
            if (Chromath.colors[name]) return Chromath.colors[name];
        }
    },
    {
        example: [3554431, 16809984],
        regex: /^\d+$/,
        process: function (color){
            return {
                //a: color >> 24 & 255,
                r: color >> 16 & 255,
                g: color >> 8 & 255,
                b: color & 255
            };
        }
    },

    {
        example: ['#fb0', 'f0f'],
        regex: /^#?([\dA-F]{1})([\dA-F]{1})([\dA-F]{1})$/i,
        process: function (hex, r, g, b){
            return {
                r: parseInt(r + r, 16),
                g: parseInt(g + g, 16),
                b: parseInt(b + b, 16)
            };
        }
    },

    {
        example: ['#00ff00', '336699'],
        regex: /^#?([\dA-F]{2})([\dA-F]{2})([\dA-F]{2})$/i,
        process: function (hex, r, g, b){
            return {
                r: parseInt(r, 16),
                g: parseInt(g, 16),
                b: parseInt(b, 16)
            };
        }
    },

    {
        example: ['rgb(123, 234, 45)', 'rgb(25, 50%, 100%)', 'rgba(12%, 34, 56%, 0.78)'],
        regex: /^rgba*\((\d{1,3}\%*),\s*(\d{1,3}\%*),\s*(\d{1,3}\%*)(?:,\s*([0-9.]+))?\)/,
        process: function (s,r,g,b,a)
        {
            r = r && r.slice(-1) == '%' ? Math.round(r.slice(0,-1) * 2.55) : r*1;
            g = g && g.slice(-1) == '%' ? Math.round(g.slice(0,-1) * 2.55) : g*1;
            b = b && b.slice(-1) == '%' ? Math.round(b.slice(0,-1) * 2.55) : b*1;
            a = a && a.slice(-1) == '%' ? Math.round(a.slice(0,-1) * 100) : a*1;

            return {
                r: clamp(r, 0, 255),
                g: clamp(g, 0, 255),
                b: clamp(b, 0, 255),
                a: clamp(a, 0, 1) || undefined
            };
        }
    },

    {
        example: ['hsl(123, 34%, 45%)', 'hsla(25, 50%, 100%, 0.75)', 'hsv(12, 34%, 56%)'],
        regex: /^hs([bvl])a*\((\d{1,3}\%*),\s*(\d{1,3}\%*),\s*(\d{1,3}\%*)(?:,\s*([0-9.]+))?\)/,
        process: function (c,lv,h,s,l,a)
        {
            h *= 1;
            s = s.slice(0,-1) / 100;
            l = l.slice(0,-1) / 100;
            a *= 1;

            var obj = {
                h: clamp(h, 0, 360),
                s: clamp(s, 0, 1),
                a: clamp(l, 0, 1)
            };
            obj[lv] = clamp(l, 0, 1);

            return obj;
        }
    }
];

/*
  Property: Chromath.colors
  Object, indexed by SVG/CSS color name, of <Chromath> instances
  The color names from CSS and SVG 1.0

  Examples:
  > > Chromath.colors.aliceblue.toRGBArray()
  > [240, 248, 255]

  > > Chromath.colors.beige.toString()
  > "#F5F5DC"

  > // Can also be accessed without `.color`
  > > Chromath.aliceblue.toRGBArray()
  > [240, 248, 255]

  > > Chromath.beige.toString()
  > "#F5F5DC"
*/
Chromath.colors = {
    // http://www.w3.org/TR/REC-html40/types.html#h-6.5
    aqua: new Chromath({r: 0, g: 255, b: 255}),
    black: new Chromath({r: 0, g: 0, b: 0}),
    blue: new Chromath({r: 0, g: 0, b: 255}),
    fuchsia: new Chromath({r: 255, g: 0, b: 255}),
    gray: new Chromath({r: 128, g: 128, b: 128}),
    green: new Chromath({r: 0, g: 128, b: 0}),
    lime: new Chromath({r: 0, g: 255, b: 0}),
    maroon: new Chromath({r: 128, g: 0, b: 0}),
    navy: new Chromath({r: 0, g: 0, b: 128}),
    olive: new Chromath({r: 128, g: 128, b: 0}),
    purple: new Chromath({r: 128, g: 0, b: 128}),
    red: new Chromath({r: 255, g: 0, b: 0}),
    silver: new Chromath({r: 192, g: 192, b: 192}),
    teal: new Chromath({r: 0, g: 128, b: 128}),
    white: new Chromath({r: 255, g: 255, b: 255}),
    yellow: new Chromath({r: 255, g: 255, b: 0}),

    // http://www.w3.org/TR/css3-color/#svg-color
    // http://www.w3.org/TR/SVG/types.html#ColorKeywords
    aliceblue: new Chromath({r: 240, g: 248, b: 255}),
    antiquewhite: new Chromath({r: 250, g: 235, b: 215}),
    aquamarine: new Chromath({r: 127, g: 255, b: 212}),
    azure: new Chromath({r: 240, g: 255, b: 255}),
    beige: new Chromath({r: 245, g: 245, b: 220}),
    bisque: new Chromath({r: 255, g: 228, b: 196}),
    blanchedalmond: new Chromath({r: 255, g: 235, b: 205}),
    blueviolet: new Chromath({r: 138, g: 43, b: 226}),
    brown: new Chromath({r: 165, g: 42, b: 42}),
    burlywood: new Chromath({r: 222, g: 184, b: 135}),
    cadetblue: new Chromath({r: 95, g: 158, b: 160}),
    chartreuse: new Chromath({r: 127, g: 255, b: 0}),
    chocolate: new Chromath({r: 210, g: 105, b: 30}),
    coral: new Chromath({r: 255, g: 127, b: 80}),
    cornflowerblue: new Chromath({r: 100, g: 149, b: 237}),
    cornsilk: new Chromath({r: 255, g: 248, b: 220}),
    crimson: new Chromath({r: 220, g: 20, b: 60}),
    cyan: new Chromath({r: 0, g: 255, b: 255}),
    darkblue: new Chromath({r: 0, g: 0, b: 139}),
    darkcyan: new Chromath({r: 0, g: 139, b: 139}),
    darkgoldenrod: new Chromath({r: 184, g: 134, b: 11}),
    darkgray: new Chromath({r: 169, g: 169, b: 169}),
    darkgreen: new Chromath({r: 0, g: 100, b: 0}),
    darkgrey: new Chromath({r: 169, g: 169, b: 169}),
    darkkhaki: new Chromath({r: 189, g: 183, b: 107}),
    darkmagenta: new Chromath({r: 139, g: 0, b: 139}),
    darkolivegreen: new Chromath({r: 85, g: 107, b: 47}),
    darkorange: new Chromath({r: 255, g: 140, b: 0}),
    darkorchid: new Chromath({r: 153, g: 50, b: 204}),
    darkred: new Chromath({r: 139, g: 0, b: 0}),
    darksalmon: new Chromath({r: 233, g: 150, b: 122}),
    darkseagreen: new Chromath({r: 143, g: 188, b: 143}),
    darkslateblue: new Chromath({r: 72, g: 61, b: 139}),
    darkslategray: new Chromath({r: 47, g: 79, b: 79}),
    darkslategrey: new Chromath({r: 47, g: 79, b: 79}),
    darkturquoise: new Chromath({r: 0, g: 206, b: 209}),
    darkviolet: new Chromath({r: 148, g: 0, b: 211}),
    deeppink: new Chromath({r: 255, g: 20, b: 147}),
    deepskyblue: new Chromath({r: 0, g: 191, b: 255}),
    dimgray: new Chromath({r: 105, g: 105, b: 105}),
    dimgrey: new Chromath({r: 105, g: 105, b: 105}),
    dodgerblue: new Chromath({r: 30, g: 144, b: 255}),
    firebrick: new Chromath({r: 178, g: 34, b: 34}),
    floralwhite: new Chromath({r: 255, g: 250, b: 240}),
    forestgreen: new Chromath({r: 34, g: 139, b: 34}),
    gainsboro: new Chromath({r: 220, g: 220, b: 220}),
    ghostwhite: new Chromath({r: 248, g: 248, b: 255}),
    gold: new Chromath({r: 255, g: 215, b: 0}),
    goldenrod: new Chromath({r: 218, g: 165, b: 32}),
    greenyellow: new Chromath({r: 173, g: 255, b: 47}),
    grey: new Chromath({r: 128, g: 128, b: 128}),
    honeydew: new Chromath({r: 240, g: 255, b: 240}),
    hotpink: new Chromath({r: 255, g: 105, b: 180}),
    indianred: new Chromath({r: 205, g: 92, b: 92}),
    indigo: new Chromath({r: 75, g: 0, b: 130}),
    ivory: new Chromath({r: 255, g: 255, b: 240}),
    khaki: new Chromath({r: 240, g: 230, b: 140}),
    lavender: new Chromath({r: 230, g: 230, b: 250}),
    lavenderblush: new Chromath({r: 255, g: 240, b: 245}),
    lawngreen: new Chromath({r: 124, g: 252, b: 0}),
    lemonchiffon: new Chromath({r: 255, g: 250, b: 205}),
    lightblue: new Chromath({r: 173, g: 216, b: 230}),
    lightcoral: new Chromath({r: 240, g: 128, b: 128}),
    lightcyan: new Chromath({r: 224, g: 255, b: 255}),
    lightgoldenrodyellow: new Chromath({r: 250, g: 250, b: 210}),
    lightgray: new Chromath({r: 211, g: 211, b: 211}),
    lightgreen: new Chromath({r: 144, g: 238, b: 144}),
    lightgrey: new Chromath({r: 211, g: 211, b: 211}),
    lightpink: new Chromath({r: 255, g: 182, b: 193}),
    lightsalmon: new Chromath({r: 255, g: 160, b: 122}),
    lightseagreen: new Chromath({r: 32, g: 178, b: 170}),
    lightskyblue: new Chromath({r: 135, g: 206, b: 250}),
    lightslategray: new Chromath({r: 119, g: 136, b: 153}),
    lightslategrey: new Chromath({r: 119, g: 136, b: 153}),
    lightsteelblue: new Chromath({r: 176, g: 196, b: 222}),
    lightyellow: new Chromath({r: 255, g: 255, b: 224}),
    limegreen: new Chromath({r: 50, g: 205, b: 50}),
    linen: new Chromath({r: 250, g: 240, b: 230}),
    magenta: new Chromath({r: 255, g: 0, b: 255}),
    mediumaquamarine: new Chromath({r: 102, g: 205, b: 170}),
    mediumblue: new Chromath({r: 0, g: 0, b: 205}),
    mediumorchid: new Chromath({r: 186, g: 85, b: 211}),
    mediumpurple: new Chromath({r: 147, g: 112, b: 219}),
    mediumseagreen: new Chromath({r: 60, g: 179, b: 113}),
    mediumslateblue: new Chromath({r: 123, g: 104, b: 238}),
    mediumspringgreen: new Chromath({r: 0, g: 250, b: 154}),
    mediumturquoise: new Chromath({r: 72, g: 209, b: 204}),
    mediumvioletred: new Chromath({r: 199, g: 21, b: 133}),
    midnightblue: new Chromath({r: 25, g: 25, b: 112}),
    mintcream: new Chromath({r: 245, g: 255, b: 250}),
    mistyrose: new Chromath({r: 255, g: 228, b: 225}),
    moccasin: new Chromath({r: 255, g: 228, b: 181}),
    navajowhite: new Chromath({r: 255, g: 222, b: 173}),
    oldlace: new Chromath({r: 253, g: 245, b: 230}),
    olivedrab: new Chromath({r: 107, g: 142, b: 35}),
    orange: new Chromath({r: 255, g: 165, b: 0}),
    orangered: new Chromath({r: 255, g: 69, b: 0}),
    orchid: new Chromath({r: 218, g: 112, b: 214}),
    palegoldenrod: new Chromath({r: 238, g: 232, b: 170}),
    palegreen: new Chromath({r: 152, g: 251, b: 152}),
    paleturquoise: new Chromath({r: 175, g: 238, b: 238}),
    palevioletred: new Chromath({r: 219, g: 112, b: 147}),
    papayawhip: new Chromath({r: 255, g: 239, b: 213}),
    peachpuff: new Chromath({r: 255, g: 218, b: 185}),
    peru: new Chromath({r: 205, g: 133, b: 63}),
    pink: new Chromath({r: 255, g: 192, b: 203}),
    plum: new Chromath({r: 221, g: 160, b: 221}),
    powderblue: new Chromath({r: 176, g: 224, b: 230}),
    rosybrown: new Chromath({r: 188, g: 143, b: 143}),
    royalblue: new Chromath({r: 65, g: 105, b: 225}),
    saddlebrown: new Chromath({r: 139, g: 69, b: 19}),
    salmon: new Chromath({r: 250, g: 128, b: 114}),
    sandybrown: new Chromath({r: 244, g: 164, b: 96}),
    seagreen: new Chromath({r: 46, g: 139, b: 87}),
    seashell: new Chromath({r: 255, g: 245, b: 238}),
    sienna: new Chromath({r: 160, g: 82, b: 45}),
    skyblue: new Chromath({r: 135, g: 206, b: 235}),
    slateblue: new Chromath({r: 106, g: 90, b: 205}),
    slategray: new Chromath({r: 112, g: 128, b: 144}),
    slategrey: new Chromath({r: 112, g: 128, b: 144}),
    snow: new Chromath({r: 255, g: 250, b: 250}),
    springgreen: new Chromath({r: 0, g: 255, b: 127}),
    steelblue: new Chromath({r: 70, g: 130, b: 180}),
    tan: new Chromath({r: 210, g: 180, b: 140}),
    thistle: new Chromath({r: 216, g: 191, b: 216}),
    tomato: new Chromath({r: 255, g: 99, b: 71}),
    turquoise: new Chromath({r: 64, g: 224, b: 208}),
    violet: new Chromath({r: 238, g: 130, b: 238}),
    wheat: new Chromath({r: 245, g: 222, b: 179}),
    whitesmoke: new Chromath({r: 245, g: 245, b: 245}),
    yellowgreen: new Chromath({r: 154, g: 205, b: 50})
};

//Group: Other Static Methods
/*
  Method: Chromath.parse
  Iterate through the objects set in Chromath.parsers and, if a match is made, return the value specified by the matching parsers `process` function

  Parameters:
  string - The string to parse

  Example:
  > > Chromath.parse('rgb(0, 128, 255)')
  > { r: 0, g: 128, b: 255, a: undefined }
 */
Chromath.parse = function (string)
{
    var parsers = Chromath.parsers, i, l, parser, parts, channels;

    for (i = 0, l = parsers.length; i < l; i++) {
        parser = parsers[i];
        parts = parser.regex.exec(string);
        if (parts && parts.length) channels = parser.process.apply(this, parts);
        if (channels) return channels;
    }
};


merge(Chromath, Chromath.colors); // Chromath.yellow, Chromath.wheat, etc

// provide `Chromath` for use in "regular" browser, CommonJS, AMD and NodeJS
expose('Chromath', Chromath);

/*!
 * expose.js
 *
 * @author Oleg Slobodskoi
 * @website https://github.com/kof/expose.js
 * @licence Dual licensed under the MIT or GPL Version 2 licenses.
 */
/* @ignore */
function expose(namespace, api)
{
    var env = {};

    if (typeof namespace !== 'string') {
        api = namespace;
        namespace = null;
    }

    // the global api of any environment
    // thanks to Nicholas C. Zakas
    // http://www.nczonline.net/blog/2008/04/20/get-the-javascript-global/
    env.global = (function (){
        return this;
    }).call(null);

    // expose passed api as exports
    env.exports = api || {};

    // commonjs
    if (typeof module !== 'undefined' &&
        typeof exports !== 'undefined' &&
        module.exports) {
        env.commonjs = true;
        env.module = module;
        module.exports = exports = env.exports;
    }

    // browser only
    if (typeof window !== 'undefined') {
        env.browser = true;
        // we are not in amd wrapper
        if (!env.commonjs && namespace && env.exports) {
            env.global[namespace] = env.exports;
        }
    }

    return env;
}

function args2rgb(r, g, b, a)
{
    var rgb = arguments[0];

    if (isArray(rgb)){ r=rgb[0]; g=rgb[1]; b=rgb[2]; a=rgb[3]; }
    if (isObject(rgb)){ r=rgb.r; g=rgb.g; b=rgb.b; a=rgb.a;  }

    return [r, g, b, a];
}

function args2hsl(h, s, l, a)
{
    var hsl = arguments[0];

    if (isArray(hsl)){ h=hsl[0]; s=hsl[1]; l=hsl[2]; a=hsl[3]; }
    if (isObject(hsl)){ h=hsl.h; s=hsl.s; l=(hsl.l || hsl.v); a=hsl.a; }

    return [h, s, l, a];
}

function rgbFraction(r, g, b)
{
    if (!isFinite(arguments[1])){
        var rgb = args2rgb(r, g, b);
        r = rgb[0], g = rgb[1], b = rgb[2];
    }

    if (r > 1) r /= 255;
    if (g > 1) g /= 255;
    if (b > 1) b /= 255;

    return [r, g, b];
}

function hslFraction(h, s, l)
{
    if (!isFinite(arguments[1])){
        var hsl = args2hsl(h, s, l);
        h = hsl[0], s = hsl[1], l = hsl[2];
    }

    h = (((h % 360) + 360) % 360);
    if (s > 1) s /= 100;
    if (l > 1) l /= 100;

    return [h, s, l];
}

// Could be pulled in from other modules
function merge()
{
    var dest = arguments[0], i=1, source, prop;
    while (source = arguments[i++])
        for (prop in source) dest[prop] = source[prop];

    return dest;
}

function isArray( test ){
    return Object.prototype.toString.call(test) === '[object Array]';
}

function isString( test ){
    return Object.prototype.toString.call(test) === '[object String]';
}

function isNumber( test ){
    return Object.prototype.toString.call(test) === '[object Number]';
}

function isObject( test ){
    return Object.prototype.toString.call(test) === '[object Object]';
}

function clamp( val, min, max )
{
    if (val > max) return max;
    if (val < min) return min;
    return val;
}

function lpad( val, len, pad )
{
    val = val.toString();
    if (!len) len = 2;
    if (!pad) pad = '0';

    while (val.length < len) val = pad+val;

    return val;
}

function lerp (from, to, by)
{
    return from + (to-from) * by;
}
//////////////////////////////////////////

})();
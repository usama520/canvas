/* more image filers for fabricjs and preset filters */

//Exposure
//via FILTRR2: https://github.com/alexmic/filtrr/blob/master/filtrr2/src/
fabric.Image.filters.Exposure = fabric.util.createClass(fabric.Image.filters.BaseFilter,{
  type: 'Exposure',
  initialize: function(options) {
    options = options || { };
    this.exposure = options.exposure || 0;
  },
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
        data = imageData.data;

    var e = this.exposure/100,
   p  = Normalize(e, -1, 1, -100, 100),
      c1 = {x: 0, y: 255 * e},
      c2 = {x: 255 - (255 * e), y: 255};

    var bezier = new Bezier({x: 0, y: 0},c1,c2,{x: 255, y: 255});

    var points = bezier.genColorTable();

    for (var i = 0, len = data.length; i < len; i += 4) {

      var r = data[i], g = data[i+1], b = data[i+2];

      data[i] = parseInt(clamp(points[r]));
      data[i+1] = parseInt(clamp(points[g]));
      data[i+2] = parseInt(clamp(points[b]));

    }
    context.putImageData(imageData, 0, 0);
  },
  toObject: function() {
    return extend(this.callSuper('toObject'), {
      contrast: this.contrast
    });
  }
});



// **Adapted from (with special thanks)** <br>
// 13thParallel.org BeziÃ©r Curve Code <br>
// *by Dan Pupius (www.pupius.net)*
var Bezier = function(C1, C2, C3, C4){
          var C1 = C1, C2 = C2, C3 = C3, C4 = C4;
          var B1 = function(t){ return t*t*t; }
          var B2 = function(t){ return 3*t*t*(1-t); }
          var B3 = function(t){ return 3*t*(1-t)*(1-t); }
          var B4 = function(t){ return (1-t)*(1-t)*(1-t); }

          var getPoint = function(t)
          {
              return {
                  x: C1.x*B1(t) + C2.x*B2(t) + C3.x*B3(t) + C4.x*B4(t),
                  y: C1.y*B1(t) + C2.y*B2(t) + C3.y*B3(t) + C4.y*B4(t)
              }
          };

          // Creates a color table for 1024 points. To create the table
          // 1024 bezier points are calculated with t = i/1024 in every
          // loop iteration and map is created for [x] = y. This is then
          // used to project a color RGB value (x) to another color RGB
          // value (y).
          this.genColorTable = function()
          {
              var points = {};
              var i; for (i = 0; i < 1024; i++)
              {
                  var point = getPoint(i/1024);
                  points[parseInt(point.x)] = parseInt(point.y);
              };
              return points;
          };
};


var Normalize = function(val, dmin, dmax, smin, smax){
          var sdist = dist(smin, smax),
              ddist = dist(dmin, dmax),
              ratio = ddist / sdist,
              val   = clamp(val, smin, smax);
          return dmin + (val-smin) * ratio;
}

function dist(x1, x2){
return Math.sqrt(Math.pow(x2 - x1, 2));
}

function clamp(val, min, max){
min = min || 0;
max = max || 255;
return Math.min(max, Math.max(min, val));
}






//Contrast
fabric.Image.filters.Contrast = fabric.util.createClass(fabric.Image.filters.BaseFilter,{
  type: 'Contrast',
  initialize: function(options) {
    options = options || { };
    this.contrast = options.contrast || 0;
  },
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
        data = imageData.data,
        contrast = Math.pow((this.contrast + 100) / 100, 2);

    for (var i = 0, len = data.length; i < len; i += 4) {
      var r = data[i], g = data[i+1], b = data[i+2];
      r /= 255;
      r -= 0.5;
      r *= contrast;
      r += 0.5;
      r *= 255;
      g /= 255;
      g -= 0.5;
      g *= contrast;
      g += 0.5;
      g *= 255;
      b /= 255;
      b -= 0.5;
      b *= contrast;
      b += 0.5;
      b *= 255;
      data[i] = r;
      data[i+1] = g;
      data[i+2] = b;
    }
    context.putImageData(imageData, 0, 0);
  },
  toObject: function() {
    return extend(this.callSuper('toObject'), {
      contrast: this.contrast
    });
  }
});





/**
 * Brightness filter class
 * @class fabric.Image.filters.Brightness
 * @memberOf fabric.Image.filters
 * @extends fabric.Image.filters.BaseFilter
 * @see {@link fabric.Image.filters.Brightness#initialize} for constructor definition
 * @see {@link http://fabricjs.com/image-filters/|ImageFilters demo}
 * @example
 * var filter = new fabric.Image.filters.Brightness({
 *   brightness: 200
 * });
 * object.filters.push(filter);
 * object.applyFilters(canvas.renderAll.bind(canvas));
 */


 /*
fabric.Image.filters.Brightness = fabric.util.createClass(fabric.Image.filters.BaseFilter,{

  type: 'Brightness',
  initialize: function(options) {
    options = options || { };
    this.brightness = options.brightness || 100;
  },
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
        data = imageData.data,
        brightness = this.brightness;

    for (var i = 0, len = data.length; i < len; i += 4) {
      data[i] += brightness;
      data[i + 1] += brightness;
      data[i + 2] += brightness;
    }

    context.putImageData(imageData, 0, 0);
  },
  toObject: function() {
    return extend(this.callSuper('toObject'), {
      brightness: this.brightness
    });
  }
});
*/


//PRESET FILTERS

//Sepia filter class

//var filter = new fabric.Image.filters.Sepia();
//object.filters.push(filter);
//object.applyFilters(canvas.renderAll.bind(canvas));
/*
fabric.Image.filters.Sepia = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'Sepia',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
        data = imageData.data,
        iLen = data.length, i, avg;

    for (i = 0; i < iLen; i+=4) {
      avg = 0.3  * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      data[i] = avg + 100;
      data[i + 1] = avg + 50;
      data[i + 2] = avg + 255;
    }

    context.putImageData(imageData, 0, 0);
  }
});
*/



function apply_rgba(imageData,rgba){
var data = imageData.data;
var length = data.length;

// Apply the color R, G, B values to each individual pixel
for ( i = 0; i < length; i += 4 ) {
  data[ i ] = rgba.r[ data[ i ] ];
    data[ i+1 ] = rgba.g[ data[ i+1 ] ];
    data[ i+2 ] = rgba.b[ data[ i+2 ] ];
}

// Apply the overall RGB contrast changes to each pixel
for ( i = 0; i < length; i += 4 ) {
  data[ i ] = rgba.a[ data[ i ] ];
    data[ i+1 ] = rgba.a[ data[ i+1 ] ];
    data[ i+2 ] = rgba.a[ data[ i+2 ] ];
}

// Restore modified image data
imageData.data = data;

return imageData;
}



//1977 Filter
fabric.Image.filters.Nine = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'Nine',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);

      var rgba = {'a':[0,1,3,4,6,7,9,10,12,13,14,16,17,19,20,22,23,25,26,28,29,31,32,34,35,37,38,39,41,42,44,45,46,48,49,50,52,53,54,55,57,58,59,60,61,62,64,65,66,67,68,69,70,72,73,74,75,76,77,78,79,80,81,82,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,125,126,127,128,129,130,131,132,133,134,135,136,137,137,138,139,140,141,142,143,144,145,146,146,147,148,149,150,151,152,153,153,154,155,156,157,158,159,160,160,161,162,163,164,165,166,166,167,168,169,170,171,172,172,173,174,175,176,177,178,178,179,180,181,182,183,183,184,185,186,187,188,188,189,190,191,192,193,193,194,195,196,197,198,199,199,200,201,202,203,204,204,205,206,207,208,209,209,210,211,212,213,214,215,215,216,217,218,219,220,221,221,222,223,224,225,226,227,227,228,229,230,231,232,233,233,234,235,236,237,238,239,240,241,241,242,243,244,245,246,247,248,249,250,250,251,252,253,254,255,255], 'r':[58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,58,59,60,60,61,62,62,63,63,64,64,65,66,66,67,67,68,69,69,70,70,71,72,72,73,74,74,75,76,77,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,95,96,97,98,99,100,102,103,104,105,106,108,109,110,111,112,113,114,116,117,118,119,120,121,122,123,125,126,127,128,129,130,131,133,134,135,136,137,138,140,141,142,143,144,146,147,148,149,151,152,153,154,156,157,158,160,161,162,164,165,166,168,169,170,172,173,175,176,177,179,180,182,183,185,186,188,189,191,192,193,194,196,197,198,199,200,201,202,203,204,204,205,206,206,207,208,208,209,209,210,210,211,211,212,212,212,213,213,213,213,213,214,214,214,214,214,214,214,214,214,214,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,214,214,214,214,214,214,214,214,214,214,213,213,213,213,213,213,213,212,212,212,212,212], 'g':[40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,41,41,42,42,42,42,43,43,43,43,44,44,44,44,45,45,45,45,46,46,46,47,47,48,48,48,49,49,50,50,51,52,52,53,54,54,55,56,57,58,59,60,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,153,154,155,156,157,158,160,161,162,163,164,166,167,168,169,171,172,173,174,175,176,178,179,180,181,182,183,185,186,187,188,189,190,191,192,193,195,196,197,198,199,200,201,202,203,205,206,207,208,209,210,211,212,214,215,216,217,218,220,221,222,223,225,226,227,228,230,231,232,233,235,236,237,239,240,241,242,244,245,246,247,249,250,251,252,254,255,255], 'b':[45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,46,46,47,47,47,48,48,48,48,49,49,49,50,50,50,51,51,51,52,52,53,53,54,54,55,56,56,57,58,59,60,61,62,62,63,64,65,66,68,69,70,71,72,73,74,75,76,77,79,80,81,82,83,84,85,86,87,89,90,91,92,93,94,96,97,98,99,100,102,103,104,105,107,108,109,110,112,113,114,115,117,118,119,120,122,123,124,126,127,128,130,131,133,134,135,137,138,140,141,143,144,145,147,148,149,151,152,153,155,156,157,159,160,161,162,164,165,166,167,168,170,171,172,173,174,175,176,177,178,179,180,181,182,184,185,186,187,188,188,189,190,191,192,193,193,194,195,195,196,196,196,197,197,197,197,198,198,198,198,198,198,198,198,198,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,198,198,198,198,198,198,197,197,197,197,197,197,197,197,197,197,197,197,197,197,198,198,198,198,198,198,198]};

      var newImageData = apply_rgba(imageData,rgba);

        context.putImageData(newImageData, 0, 0);
  }
});

//Brannan
fabric.Image.filters.Brannan = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'Brannan',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);

    var rgba = {'a':[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,255], 'r':[50,50,50,50,50,50,50,50,50,50,50,50,50,51,51,51,51,51,52,53,54,55,56,57,59,60,62,63,64,66,67,68,69,70,71,71,72,73,73,74,75,75,76,76,77,77,78,78,79,79,80,80,81,81,82,83,83,84,85,86,87,88,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,111,112,113,114,115,116,118,119,120,121,122,124,125,126,128,129,130,132,133,134,136,137,139,140,141,143,144,146,147,149,150,152,153,154,156,157,159,160,162,163,164,166,167,169,170,171,173,174,175,177,178,179,181,182,183,185,186,187,189,190,192,193,195,196,198,199,201,203,204,206,207,209,210,212,213,215,216,217,219,220,221,223,224,225,226,227,228,229,230,231,232,233,234,235,236,236,237,238,239,239,240,241,241,242,243,243,244,244,245,246,246,247,247,248,248,249,249,249,250,250,251,251,251,252,252,252,253,253,253,254,254,254,254,254,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,254,254,254,254,254,254], 'g':[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,3,4,4,5,6,7,8,10,11,12,13,14,16,17,18,19,20,21,23,24,25,26,27,28,29,30,32,33,34,35,36,38,39,40,41,43,44,45,47,48,50,51,53,54,56,57,59,61,62,64,66,68,70,72,74,76,78,80,82,84,87,89,91,93,95,97,100,102,104,106,108,110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,142,144,146,148,150,152,154,156,158,160,161,163,165,167,168,170,172,173,175,176,178,179,181,182,183,184,186,187,188,189,190,191,192,193,193,194,195,196,196,197,198,198,199,200,200,201,202,202,203,203,204,204,205,205,206,207,207,208,208,209,210,210,211,212,212,213,214,214,215,216,217,217,218,219,219,220,221,221,222,222,223,224,224,225,225,226,226,227,228,228,229,229,229,230,230,231,231,232,232,233,233,233,234,234,234,235,235,236,236,236,237,237,237,238,238,239,239,239,240,240,240,241,241,241,242,242,242,243,243,243,244,244,244,245,245,245,246,246,247,247,247,248,248,249,249,250,250,251,251,252,252,252], 'b':[48,48,48,48,48,48,48,48,49,49,49,49,49,49,49,50,50,50,51,51,51,52,52,53,53,54,54,54,55,55,56,56,57,57,58,58,59,60,60,61,61,62,62,63,64,64,65,66,66,67,68,68,69,70,71,71,72,73,74,75,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,92,93,94,95,96,98,99,100,101,102,103,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,132,133,134,135,136,137,138,139,140,141,141,142,143,144,145,146,146,147,148,148,149,150,151,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,168,169,170,171,172,173,174,175,176,177,178,178,179,180,181,181,182,183,183,184,184,185,185,185,186,186,187,187,187,188,188,188,189,189,190,190,191,191,192,193,193,194,195,195,196,197,198,199,200,200,201,202,203,204,205,206,206,207,208,209,210,211,211,212,213,214,214,215,216,216,217,218,218,219,219,220,220,221,222,222,222,223,223,224,224,224,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225]};

      var newImageData = apply_rgba(imageData,rgba);

        context.putImageData(newImageData, 0, 0);
  }
});

//Gotham
fabric.Image.filters.Gotham = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'Gotham',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);

      var rgba = {'a':[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,255], 'r':[50,50,50,50,50,50,50,50,50,50,50,50,50,51,51,51,51,51,52,53,54,55,56,57,59,60,62,63,64,66,67,68,69,70,71,71,72,73,73,74,75,75,76,76,77,77,78,78,79,79,80,80,81,81,82,83,83,84,85,86,87,88,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,111,112,113,114,115,116,118,119,120,121,122,124,125,126,128,129,130,132,133,134,136,137,139,140,141,143,144,146,147,149,150,152,153,154,156,157,159,160,162,163,164,166,167,169,170,171,173,174,175,177,178,179,181,182,183,185,186,187,189,190,192,193,195,196,198,199,201,203,204,206,207,209,210,212,213,215,216,217,219,220,221,223,224,225,226,227,228,229,230,231,232,233,234,235,236,236,237,238,239,239,240,241,241,242,243,243,244,244,245,246,246,247,247,248,248,249,249,249,250,250,251,251,251,252,252,252,253,253,253,254,254,254,254,254,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,254,254,254,254,254,254], 'g':[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,3,4,4,5,6,7,8,10,11,12,13,14,16,17,18,19,20,21,23,24,25,26,27,28,29,30,32,33,34,35,36,38,39,40,41,43,44,45,47,48,50,51,53,54,56,57,59,61,62,64,66,68,70,72,74,76,78,80,82,84,87,89,91,93,95,97,100,102,104,106,108,110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,142,144,146,148,150,152,154,156,158,160,161,163,165,167,168,170,172,173,175,176,178,179,181,182,183,184,186,187,188,189,190,191,192,193,193,194,195,196,196,197,198,198,199,200,200,201,202,202,203,203,204,204,205,205,206,207,207,208,208,209,210,210,211,212,212,213,214,214,215,216,217,217,218,219,219,220,221,221,222,222,223,224,224,225,225,226,226,227,228,228,229,229,229,230,230,231,231,232,232,233,233,233,234,234,234,235,235,236,236,236,237,237,237,238,238,239,239,239,240,240,240,241,241,241,242,242,242,243,243,243,244,244,244,245,245,245,246,246,247,247,247,248,248,249,249,250,250,251,251,252,252,252], 'b':[48,48,48,48,48,48,48,48,49,49,49,49,49,49,49,50,50,50,51,51,51,52,52,53,53,54,54,54,55,55,56,56,57,57,58,58,59,60,60,61,61,62,62,63,64,64,65,66,66,67,68,68,69,70,71,71,72,73,74,75,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,92,93,94,95,96,98,99,100,101,102,103,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,132,133,134,135,136,137,138,139,140,141,141,142,143,144,145,146,146,147,148,148,149,150,151,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,168,169,170,171,172,173,174,175,176,177,178,178,179,180,181,181,182,183,183,184,184,185,185,185,186,186,187,187,187,188,188,188,189,189,190,190,191,191,192,193,193,194,195,195,196,197,198,199,200,200,201,202,203,204,205,206,206,207,208,209,210,211,211,212,213,214,214,215,216,216,217,218,218,219,219,220,220,221,222,222,222,223,223,224,224,224,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225]};

      var newImageData = apply_rgba(imageData,rgba);

        context.putImageData(newImageData, 0, 0);
  }
});


//Hefe
fabric.Image.filters.Hefe = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'Hefe',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);

      var rgba = {'a':[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,255], 'r':[32,32,32,32,32,32,32,32,32,32,32,32,32,33,33,33,33,33,34,35,36,38,39,41,43,45,48,50,52,54,56,58,60,62,64,65,67,69,71,73,75,77,79,81,83,85,87,89,91,93,95,96,98,100,102,104,106,108,110,112,114,116,117,119,121,123,125,126,128,130,132,133,135,137,139,140,142,144,146,147,149,151,152,154,155,157,158,160,161,163,164,166,167,168,170,171,172,173,175,176,177,178,179,180,181,182,184,185,186,187,188,189,190,190,191,192,193,194,195,196,197,197,198,199,200,201,201,202,203,204,204,205,205,206,206,207,207,208,208,209,209,210,210,211,211,212,212,213,213,214,214,215,215,216,216,217,217,218,218,219,219,220,220,221,221,221,222,222,223,223,224,224,225,225,225,226,226,227,227,228,228,228,229,229,230,230,231,231,231,232,232,233,233,233,234,234,235,235,235,236,236,236,237,237,238,238,238,239,239,239,240,240,240,241,241,242,242,242,243,243,243,244,244,245,245,245,246,246,247,248,248,249,249,250,250,251,251,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252], 'g':[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,19,20,21,23,24,25,27,28,30,31,33,34,36,37,39,40,42,44,45,47,49,50,52,54,56,57,59,61,63,65,67,69,71,73,75,78,80,82,85,87,89,92,94,97,99,102,104,106,109,111,114,116,118,121,123,125,127,129,131,133,135,137,139,141,143,145,146,148,150,152,154,156,157,159,161,163,164,166,168,169,171,173,174,176,178,179,181,182,184,185,187,188,190,191,192,194,195,196,197,198,199,200,201,202,203,204,205,205,206,207,207,208,209,209,210,210,211,211,211,212,212,213,213,213,214,214,215,215,216,216,216,217,217,218,218,219,219,220,220,220,221,221,222,222,222,223,223,224,224,225,225,225,226,226,227,227,228,228,228,229,229,230,230,231,231,232,232,232,233,233,234,234,235,235,236,236,237,237,238,238,239,239,239,240,240,241,241,242,242,243,244,244,245,246,246,247,248,249,249,250,250,251,251,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252,252], 'b':[2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,7,8,8,9,9,9,10,10,11,12,12,13,13,14,15,15,16,17,17,18,19,19,20,21,22,23,24,24,25,26,27,28,29,30,32,33,34,35,36,38,39,40,42,43,45,47,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,87,89,91,93,95,96,98,100,101,103,105,107,108,110,112,113,115,117,118,120,122,123,125,127,128,130,131,133,135,136,138,140,141,143,145,146,148,149,151,153,154,156,158,159,161,163,164,166,167,169,170,171,173,174,175,177,178,179,180,182,183,184,185,186,187,189,190,191,192,193,194,195,195,196,197,198,198,199,200,200,201,201,202,202,203,203,204,204,204,205,205,205,206,206,206,207,207,207,207,208,208,209,209,209,210,210,211,211,211,212,212,213,213,214,214,214,215,215,216,216,216,217,217,218,218,218,219,219,220,220,220,221,221,222,222,222,223,223,224,224,225,225,226,226,227,227,227,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228]};

      var newImageData = apply_rgba(imageData,rgba);

        context.putImageData(newImageData, 0, 0);
  }
});


//Lord Kelvin
fabric.Image.filters.LordKelvin = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'LordKelvin',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);

      var rgba = {'a':[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,255], 'r':[43,44,46,47,49,50,52,53,55,56,58,59,61,62,64,65,67,69,70,72,73,75,77,78,80,81,83,85,86,88,90,91,93,95,96,98,100,102,103,105,107,109,111,112,114,116,118,120,121,123,125,127,129,130,132,134,136,137,139,141,142,144,146,147,149,151,152,154,155,157,158,160,162,163,165,166,168,169,171,172,174,175,176,178,179,180,182,183,184,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,201,202,203,204,204,205,206,207,207,208,209,210,210,211,212,212,213,214,214,215,216,217,217,218,219,219,220,221,222,222,223,224,224,225,225,226,227,227,228,228,229,229,229,230,230,231,231,232,232,232,233,233,233,234,234,235,235,235,236,236,236,237,237,237,238,238,239,239,239,240,240,240,241,241,241,242,242,242,243,243,243,243,244,244,244,245,245,245,245,245,246,246,246,246,246,247,247,247,247,247,248,248,248,248,248,248,249,249,249,249,249,249,249,250,250,250,250,250,250,250,250,251,251,251,251,251,251,251,251,251,252,252,252,252,252,252,252,252,252,253,253,253,253,253,253,253,253,254,254,254,254,254], 'g':[36,36,36,36,36,36,36,36,36,36,36,36,36,37,37,37,37,37,37,38,38,38,39,39,40,40,41,41,42,43,43,44,45,46,47,47,48,49,50,51,52,53,54,55,56,57,59,60,61,62,63,64,65,67,68,69,70,71,72,73,75,76,77,78,79,80,81,82,83,84,86,87,88,89,90,91,92,93,95,96,97,98,99,100,101,102,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,155,156,157,158,158,159,160,160,161,161,162,163,163,164,164,165,165,166,166,167,167,168,168,168,169,169,170,171,171,172,172,173,173,174,174,175,175,176,177,177,178,178,179,179,180,180,181,181,182,182,182,183,183,184,184,184,185,185,185,186,186,186,186,187,187,187,187,188,188,188,188,188,189,189,189,189,189,190,190,190,190,190,190,190,191,191,191,191,191,191,191,191,192,192,192,192,192,192,192,192,193,193,193,193,193,193,193,193,194,194,194,194,194,194,194,195,195,195,195], 'b':[69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,70,70,70,70,70,70,70,70,70,70,71,71,71,72,72,73,73,73,74,74,75,75,76,76,77,78,78,79,79,80,80,81,81,82,82,82,83,83,84,84,84,85,85,86,86,86,87,87,87,88,88,88,89,89,90,90,90,91,91,91,92,92,93,93,93,94,94,95,95,96,96,96,97,97,98,99,99,100,100,101,101,102,102,102,103,103,103,104,104,104,105,105,105,106,106,106,106,107,107,107,107,108,108,108,108,109,109,109,110,110,110,111,111,111,111,112,112,112,113,113,113,114,114,114,115,115,115,115,116,116,116,116,117,117,117,117,117,118,118,118,118,118,118,119,119,119,119,119,119,119,120,120,120,120,120,120,120,120,120,121,121,121,121,121,121,121,121,121,121,121,122,122,122,122,122,122,122,122,122,122,122,122,123,123,123,123,123,123,123,123,123,123,123,124,124,124,124,124,124]};

      var newImageData = apply_rgba(imageData,rgba);

        context.putImageData(newImageData, 0, 0);
  }
});

//Nashville
fabric.Image.filters.Nashville = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'Nashville',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);

      var rgba = {'a':[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,255], 'r':[56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,57,57,58,58,59,59,60,61,62,63,64,65,66,67,68,69,71,72,73,75,76,78,79,81,82,84,85,87,88,90,91,93,95,96,98,100,102,104,106,108,110,113,115,117,120,122,124,127,129,131,133,136,138,140,142,144,146,148,150,152,154,155,157,159,160,162,164,165,167,168,170,171,173,174,175,177,178,179,181,182,183,185,186,187,189,190,191,192,194,195,196,197,198,200,201,202,203,204,205,206,208,209,209,210,211,212,213,214,215,216,217,217,218,219,220,220,221,222,223,223,224,225,226,226,227,228,228,229,230,230,231,231,232,233,233,234,234,235,235,236,237,237,238,238,239,239,240,240,240,241,241,242,242,243,243,243,244,244,245,245,245,246,246,246,247,247,247,248,248,248,248,249,249,249,249,250,250,250,250,251,251,251,251,251,252,252,252,252,252,253,253,253,253,253,254,254,254,254,254,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255], 'g':[38,39,39,40,41,41,42,42,43,44,44,45,46,46,47,48,49,50,51,52,53,55,56,57,59,60,61,63,64,65,67,68,69,71,72,73,74,76,77,78,80,81,82,84,85,86,87,89,90,91,93,94,95,97,98,99,101,102,103,104,106,107,108,110,111,112,114,115,116,118,119,121,122,123,125,126,128,129,130,132,133,134,136,137,138,140,141,142,143,145,146,147,148,149,150,151,152,153,154,155,156,157,158,158,159,160,161,162,163,163,164,165,166,166,167,168,169,169,170,171,172,172,173,174,175,176,176,177,178,179,180,181,181,182,183,184,185,186,187,187,188,189,189,190,191,191,192,193,193,194,194,195,195,196,197,197,198,198,199,199,200,200,201,201,202,202,202,203,203,204,204,205,205,205,206,206,207,207,207,208,208,208,209,209,209,210,210,210,211,211,211,212,212,212,213,213,213,213,214,214,214,214,215,215,215,215,216,216,216,216,216,217,217,217,217,217,218,218,218,218,218,218,219,219,219,219,219,220,220,220,220,220,220,220,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221,221], 'b':[97,98,98,99,99,100,100,101,101,102,102,103,104,104,105,105,106,107,107,108,109,110,110,111,112,113,114,114,115,116,116,117,118,118,119,119,120,120,121,121,122,122,123,123,124,124,124,125,125,126,126,127,127,127,128,128,129,129,129,130,130,131,131,132,132,132,133,133,134,134,135,135,136,136,136,137,137,138,138,139,139,139,140,140,141,141,142,142,142,143,143,144,144,144,145,145,146,146,147,147,147,148,148,149,149,150,150,151,151,151,152,152,153,153,154,154,154,155,155,155,156,156,156,157,157,157,158,158,158,158,158,158,159,159,159,159,159,159,159,159,159,159,159,160,160,160,160,160,161,161,161,162,162,162,162,163,163,163,163,164,164,164,164,165,165,165,165,165,165,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,167,167,167,167,167,167,167,167,167,168,168,168,168,168,168,169,169,169,169,169,170,170,170,170,171,171,171,171,171,172,172,172,172,172,173,173,173,173,173,173,173,174,174,174,174,174,174,174,174,175,175,175,175,175,175,175,175,175,175,175,176,176,176,176,176,176,176,176,176,176]};

      var newImageData = apply_rgba(imageData,rgba);

        context.putImageData(newImageData, 0, 0);
  }
});

//X-PRO II
fabric.Image.filters.XPRO = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'XPRO',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);

    var rgba = {'a':[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,255], 'r':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,3,3,4,4,5,5,5,6,7,7,8,8,9,9,10,11,11,12,13,14,14,15,16,17,17,18,19,20,21,22,23,24,25,26,27,28,29,31,32,33,34,35,37,38,39,41,42,43,45,46,48,49,51,52,54,55,57,58,60,62,63,65,67,68,70,72,74,76,77,79,81,83,85,87,89,91,93,95,97,99,101,103,105,106,108,110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,141,143,145,147,149,151,153,155,157,159,161,163,165,167,169,171,172,174,176,178,180,182,184,186,188,189,191,193,194,196,198,199,201,202,204,205,207,208,209,211,212,214,215,216,217,219,220,221,222,223,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,239,240,241,242,243,243,244,245,246,246,247,248,248,249,249,250,250,251,251,252,252,252,253,253,253,253,253,253,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,255,255,255,255,255,255,255,255], 'g':[0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,4,4,4,5,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,14,14,15,16,17,18,18,19,20,21,22,23,24,25,26,27,28,29,30,31,33,34,35,36,37,39,40,41,43,44,45,47,48,50,51,53,54,56,57,59,61,62,64,66,67,69,71,73,75,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,142,144,146,148,150,152,154,156,158,160,161,163,165,167,169,171,173,175,176,178,180,182,183,185,187,189,190,192,193,195,197,198,200,201,203,204,206,207,209,210,211,213,214,216,217,218,219,221,222,223,224,226,227,228,229,230,231,232,233,234,235,236,237,237,238,239,240,240,241,242,243,243,244,244,245,246,246,247,247,248,248,249,249,250,250,250,251,251,252,252,252,253,253,253,253,253,253,254,254,254,254,254,254,254,254,254,254,254,254,254,254,254,255,255,255,255,255,255,255,255,255,255], 'b':[24,25,26,27,28,28,29,30,31,32,33,34,35,35,36,37,38,39,40,41,41,42,43,44,45,45,46,47,48,49,49,50,51,52,53,53,54,55,56,56,57,58,59,59,60,61,62,62,63,64,64,65,66,67,67,68,69,70,70,71,72,73,73,74,75,76,77,77,78,79,80,81,81,82,83,84,85,86,86,87,88,89,90,91,91,92,93,94,95,96,96,97,98,99,100,101,101,102,103,104,105,106,107,107,108,109,110,111,112,113,114,114,115,116,117,118,119,119,120,121,122,123,124,124,125,126,127,127,128,129,129,130,130,131,131,132,132,133,134,134,135,136,137,138,138,139,140,141,142,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,162,163,164,165,165,166,167,168,168,169,170,171,171,172,173,173,174,175,176,176,177,178,178,179,180,181,182,182,183,184,185,185,186,187,188,189,189,190,191,192,193,193,194,195,196,197,197,198,199,200,200,201,202,203,204,204,205,206,206,207,208,208,209,210,210,211,212,212,213,214,215,215,216,217,218,218,219,220,221,221,222,223,224,225,226,226,227,228,229]};

      var newImageData = apply_rgba(imageData,rgba);

        context.putImageData(newImageData, 0, 0);
  }
});



//you could add more preset filters from these links:
/*
http://www.sitepoint.com/fabric-js-the-fun-stuff/

http://camanjs.com/examples/
http://cdnjs.cloudflare.com/ajax/libs/camanjs/4.0.0/caman.full.js

http://www.phpied.com/files/canvas/pixels.html
http://fabricjs.com/fabric-intro-part-2/#image_filters
*/


/*
fabric.Image.filters.LordKelvin = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  type: 'LordKelvin',
  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);


      var newImageData = apply_rgba(imageData,rgba);

        context.putImageData(newImageData, 0, 0);
  }
});
*/



//http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
//add sabel
/*
   sobel = function() {
      runFilter('sobel', function(px) {
        px = Filters.grayscale(px);
        var vertical = Filters.convoluteFloat32(px,
          [-1,-2,-1,
            0, 0, 0,
            1, 2, 1]);
        var horizontal = Filters.convoluteFloat32(px,
          [-1,0,1,
           -2,0,2,
           -1,0,1]);
        var id = Filters.createImageData(vertical.width, vertical.height);
        for (var i=0; i<id.data.length; i+=4) {
          var v = Math.abs(vertical.data[i]);
          id.data[i] = v;
          var h = Math.abs(horizontal.data[i]);
          id.data[i+1] = h
          id.data[i+2] = (v+h)/4;
          id.data[i+3] = 255;
        }
        return id;
      });
    }
*/


//threshold
/*
 Filters.threshold = function(pixels, threshold) {
        var d = pixels.data;
        for (var i=0; i<d.length; i+=4) {
          var r = d[i];
          var g = d[i+1];
          var b = d[i+2];
          var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
          d[i] = d[i+1] = d[i+2] = v
        }
        return pixels;
      };
*/

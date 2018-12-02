var undocanvas = {};
var undoobject = {};
var initW = $("#main").width();

var el; //should not need this
var selection_object_left = 0;
var selection_object_top = 0;
var colorThief = new ColorThief();
var cropflag = false;
var objects = [];
var URLObj = window.URL || window.webkitURL;

var canvas = new fabric.Canvas('canvas', {
    isDrawingMode: false
});

fabric.Object.prototype.transparentCorners = false;

canvas.setDimensions({
    "width": initW,
    "height": 500
});
$("#canvasW").val(initW);

canvas.on({
    'object:selected': function(e) {
        //make sure all origin points are tracked from top left corner
        if (e.target.getOriginX() == "center") {
            e.target.setOriginY("top");
            e.target.setOriginX("left");
        }
        //only allow 1 object selection at a time for editing
        if (!e.target._objects) {
            killcrop();
            showOptions(e.target);
            getColorThief(e.target._element);
            trackHistory(e);
        }
    },
    'selection:cleared': function(e) {
        killcrop();
        $("#allOptions").hide();
        $(".imageOptions").hide();
        $("#textOptions").hide();
    },
    'object:modified': function(e) {
        //does not work for reisze via mouse
        updateOptions(e.target);
        saveit(e.target);
    },
});


//initial setup of sample image objects
fabric.Image.fromURL('/demos/canvasedit/images/wall-poster1.jpg', function(oImg) {
    add(oImg,10,10);
});

fabric.Image.fromURL('/demos/canvasedit/images/sunset1.jpg', function(oImg) {
    add(oImg,75,98);
});

canvas.renderAll();



//DRAG and DROP and IMAGE ADD
window.ondragover = function(e) {
    e.preventDefault()
}
document.querySelector(".upper-canvas").ondrop = function(e) {
    e.preventDefault();
    var length = e.dataTransfer.files.length;
    for (i = 0; i < length; i++) {
        file = e.dataTransfer.files[i];
        if (file.type.match(/image.*/)) {
            process(file);
        }
        // else uk notification!!
    }
}

/* main process function */
function process(file, x, y) {
    var url = URLObj.createObjectURL(file);
    fabric.Image.fromURL(url, function(oImg) {
        add(oImg, x, y);
    });
}

var addImages = document.getElementById("addImages");
var files = document.getElementById("filesinput");

addImages.addEventListener("click", function() {
    drawoff();
    files.click();
}, false);

files.addEventListener("change", function(e) {
    var files = e.target.files;
    for (i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.type.match(/image.*/)) {
            process(file);
        }
        // else uk notification!!
    }
}, false);

//add image to canvas
function add(img, x, y) {
    if(x && y){
        img.top = x;
        img.left = y;
    } else {
        img.top = Math.floor(Math.random() * (y || canvas.height / 2)) + 1;
        img.left = Math.floor(Math.random() * (x || canvas.width / 2)) + 1;
    }
    canvas.add(img);
}


//resize canvas to fit object
$("#canvasfit").click(function() {

    var obj = canvas.getActiveObject();

    if ($(this).hasClass("selected")) {
        $(this).removeClass("selected");

        obj.setLeft(undocanvas.left);
        obj.setTop(undocanvas.top);
        canvas.setDimensions({
            "width": undocanvas.canW,
            "height": undocanvas.canH
        });
        $("#canvasW").val(undocanvas.canW);
        $("#canvasH").val(undocanvas.canH);

        $(window).on("resize", resizeit);
        $("#autofit").addClass("uk-active");

    } else {
        $(this).addClass("selected");
        undocanvas.left = obj.getLeft();
        undocanvas.top = obj.getTop();
        undocanvas.canW = canvas.getWidth();
        undocanvas.canH = canvas.getHeight();

        obj.setLeft(0);
        obj.setTop(0);
        canvas.setDimensions({
            "width": obj.width * obj.scaleX,
            "height": obj.height * obj.scaleY
        });
        $("#canvasW").val(obj.width);
        $("#canvasH").val(obj.height);
        obj.bringToFront();

        //remove autofit for canvas
        resizeoff();
    }

    obj.setCoords();
    canvas.calcOffset();

});

//resize object to fit canvas
$("#objectfit").click(function() {

    var obj = canvas.getActiveObject();

    if ($(this).hasClass("selected")) {
        $(this).removeClass("selected");

        obj.setLeft(undoobject.left);
        obj.setTop(undoobject.top);
        obj.setWidth(undoobject.canW);
        obj.setHeight(undoobject.canH);

        obj.setScaleX(undoobject.sx);
        obj.setScaleY(undoobject.sy);

        $("#objWidth").val(undoobject.canW);
        $("#objHeight").val(undoobject.canH);

    } else {
        $(this).addClass("selected");

        undoobject.left = obj.getLeft();
        undoobject.top = obj.getTop();
        undoobject.canW = Number($("#objWidth").val());
        undoobject.canH = Number($("#objHeight").val());
        undoobject.sx = obj.getScaleX();
        undoobject.sy = obj.getScaleY();

        obj.setLeft(0);
        obj.setTop(0);

        obj.setWidth(canvas.getWidth());
        obj.setHeight(canvas.getHeight());
        obj.setScaleX(1);
        obj.setScaleY(1);

        $("#objWidth").val(canvas.getWidth());
        $("#objHeight").val(canvas.getHeight());

    }

    obj.setCoords();
    canvas.renderAll();

    $("#objScaleX").val(obj.getScaleX());
    $("#objScaleY").val(obj.getScaleY());

});

//update canvas objects and complexity
$("#canvasinfo").click(function() {
    $("#canvasobjects").text(canvas.getObjects().length);
    $("#canvascomplexity").text(canvas.complexity());

    if ($(this).hasClass("selected")) {
        $(this).removeClass("selected");
    } else {
        $(this).addClass("selected");
    }

});

//load custom SVG
$("#loadCustomSVG").click(function() {
    var svg = $("#customsvg").val();
    $(".uk-modal-close").trigger("click");
    fabric.loadSVGFromString(svg, function(objects) {
        canvas.add.apply(canvas, objects);
        canvas.renderAll();
    });
});

//close canvas options
$("#closeCC").click(function() {
    $("#canvasinfo").trigger("click");
});



//WEBCAM
var sayCheese = new SayCheese('#webcamDiv', {
    snapshots: true
});

sayCheese.on('start', function() {
    $("#webcamIMG").hide();
    $('#action-buttons').fadeIn('fast');

    $('#take-snapshot').on('click', function(evt) {
        sayCheese.takeSnapshot();
    });
});

sayCheese.on('error', function(error) {
    $(".uk-alert-danger p").text(error.name);
    $(".uk-modal-close:visible").trigger("click");
    $(".uk-alert-danger").show();
    window.setTimeout(function() {
        $(".uk-alert").hide();
    }, 2000);
});


sayCheese.on('snapshot', function(snapshot) {
    fabric.Image.fromURL(snapshot.toDataURL('image/png'), function(img) {
        img.left = 0;
        img.top = 0;
        canvas.add(img);
        img.bringToFront();
        canvas.renderAll();
    });
    $(".uk-modal-close:visible").trigger("click");
    sayCheese.stop();

    //modal.hide();
    //new $.UIkit.modal.Modal(".modalSelector");
});

$("#addWebcam").click(function() {
    drawoff();
    $("#webcamIMG").show();
    $("#webcamDiv video").remove();
    sayCheese.start();
});



//COLORTHIEF
function getColorThief(img) {
    if (img) {
        var palette = colorThief.getPalette(img);
        if (palette.length > 0) {
            pal = '<div id="palette">';
            palette.forEach(function(f) {
                pal += '<div class="swatch" style="background-color: rgb(' + f.toString() + ')"></div>';
            });
            pal += '</div>';
        }
        $("#colorThief").html(pal);
    }
}


//RESIZE FUNCTIONS
function resizeit() {
    var w = $("#main").width();
    $("#canvasW").val(w);
    canvas.setWidth(w);
    canvas.calcOffset(); //instead of after render
};
$(window).on("resize", resizeit);

function resizeoff() {
    $(window).off("resize");
    $("#autofit").removeClass("uk-active");
}
$("#canvasW").change(function() {
    resizeoff();
    canvas.setWidth(Number($(this).val()));
    canvas.calcOffset(); //instead of after render
    //canvas.renderAll();
});
$("#canvasH").change(function() {
    resizeoff();
    canvas.setHeight(Number($(this).val()));
    canvas.calcOffset(); //instead of after render
    //canvas.renderAll();
});

$("#autofit").click(function() {
    var check = $(this).hasClass("uk-active");
    if (check) {
        resizeoff();
    } else {
        $(window).on("resize", resizeit);
        resizeit();
        $(this).addClass("uk-active");
    }
});

$("#canvascolor").change(function() {
    canvas.setBackgroundColor($(this).val());
    canvas.renderAll();
});




//DELETE, CLEAR, SAVE, CLONE
function del() {
    var obj = canvas.getActiveObject();
    if (obj) {
        canvas.remove(obj);
    }
}

//delete key
$('html').keyup(function(e) {
    if (e.keyCode == 46) {
        del();
    }
});

$("#delete").click(function() {
    del();
});

$("#clear").click(function() {
    drawoff();
    canvas.clear();
});



//SAVE
function dropimage(imgdata) {
    $("#images").html('<div><img src="' + imgdata + '"/><br><a href="#" id="deleteimage" class="uk-button uk-button-danger">Remove</a><a href="' + imgdata + '" download="download" id="saveimage" class="uk-button uk-button-success">Save</a></div>');

    //SAVE to imgur or social media or even trigger add_this here!!

    $("#images").show();
    $("#deleteimage").click(function() {
        $(this).parent().remove();
    });

    window.setTimeout(function(){
        window.scrollTo(0,parseInt(canvas.height+100));
    }, 200);
}
$('#savePNG').on('click', function() {
    drawoff();
    canvas.deactivateAll().renderAll();
    var imgdata = canvas.toDataURL();
    dropimage(imgdata);
});
$('#saveJPG').on('click', function() {
    drawoff();
    canvas.deactivateAll().renderAll();
    var o = {};
    o.format = "jpeg";
    var imgdata = canvas.toDataURL(o);
    dropimage(imgdata);
});




//CLONE
$('#clone').on('click', function(event) {
    var obj = canvas.getActiveObject();

    //obj.clipTo = null; //fix cropping issues

    if (obj._element || obj.path) {
        obj.clone(function(clone) {
            //clone.set({left:0});
            clone.clipTo = null; //if you dont wnat this, u need to be able to track and map objects to theri clipTo properties in the objects array
            canvas.add(clone);
            canvas.setActiveObject(clone);
            clone.bringToFront();
        });
    } else {
        var clone = obj.clone();
        //clone.set({left:0});
        clone.clipTo = null;
        clone.padding = obj.padding;
        canvas.add(clone);
        canvas.setActiveObject(clone);
        clone.bringToFront();
    }
});

var wheelupdate;

//mousewheel resize
$(canvas.wrapperEl).on('mousewheel', function(evt) {

    var target = canvas.getActiveObject();

    if (target) {

        var e = evt.originalEvent;
        var delta = e.wheelDelta / 1200;

        target.scaleX += delta;
        target.scaleY += delta;

        // constrain
        if (target.scaleX < 0.1) {
            target.scaleX = 0.1;
            target.scaleY = 0.1;
        }
        // constrain
        if (target.scaleX > 10) {
            target.scaleX = 10;
            target.scaleY = 10;
        }

        target.setCoords();
        canvas.renderAll();

        window.clearTimeout(wheelupdate);
        wheelupdate = window.setTimeout(function() {
            updateOptions(target);
            saveit(target);
        }, 200);

        return false;
    }

});


$("#objWidth").change(function() {
    var obj = canvas.getActiveObject();
    obj.setWidth($(this).val());
    saveit(obj);
    canvas.renderAll();
});
$("#objHeight").change(function() {
    var obj = canvas.getActiveObject();
    obj.setHeight($(this).val());
    saveit(obj);
    canvas.renderAll();
});
$("#objScaleX").change(function() {
    var obj = canvas.getActiveObject();
    obj.setScaleX($(this).val());
    saveit(obj);
    canvas.renderAll();
});
$("#objScaleY").change(function() {
    var obj = canvas.getActiveObject();
    obj.setScaleY($(this).val());
    saveit(obj);
    canvas.renderAll();
});
$("#objAngle").change(function() {
    var obj = canvas.getActiveObject();
    obj.setAngle($(this).val());
    saveit(obj);
    canvas.renderAll();
});
$("#objPosX").change(function() {
    var obj = canvas.getActiveObject();
    obj.setLeft(parseFloat($(this).val()));
    saveit(obj);
    canvas.renderAll();
});
$("#objPosY").change(function() {
    var obj = canvas.getActiveObject();
    obj.setTop(parseFloat($(this).val()));
    saveit(obj);
    canvas.renderAll();
});

$("#flipx").click(function() {
    var obj = canvas.getActiveObject();
    $(this).toggleClass("uk-active");
    var v = obj.getFlipX();
    obj.setFlipX(!v);
    canvas.renderAll();
});
$("#flipy").click(function() {
    var obj = canvas.getActiveObject();
    $(this).toggleClass("uk-active");
    var v = obj.getFlipY();
    obj.setFlipY(!v);
    canvas.renderAll();
});




function killcrop() {
    if (cropflag == true) {
        var cropper = canvas.getObjects().filter(function(f) {
            return f.cropper
        });
        if (cropper) {
            canvas.remove(cropper[0]);
            objects.pop();
            $('#applycrop').hide();
            $('#startCrop').show();
            cropflag = false;
        }
    }
}


//CROPPING CAPABILITY
$('#applycrop').on('click', function(event) {

    //canvas.calcOffset();

    var object = objects.pop();

    var el = canvas.getActiveObject(); //because now active object is the cropper you need to track the underlying active object!!

    var left = el.left - object.left;
    var top = el.top - object.top;

    left *= 1;
    top *= 1;

    var width = el.width * 1;
    var height = el.height * 1;

    object.a = -(el.width / 2) + left;
    object.b = -(el.height / 2) + top;
    object.c = parseInt(width * el.scaleX);
    object.d = parseInt(el.scaleY * height);

    object.clipTo = function(ctx) {
        ctx.rect(object.a, object.b, object.c, object.d);
    }

    disabled = true;

    canvas.remove(canvas.getActiveObject());
    canvas.renderAll();
    $(this).hide();
    $('#startCrop').show();

});



$('#startCrop').on('click', function() {

    $('#applycrop').show();
    $(this).hide();

    canvas.remove(el); //this is the rectangle used for cropping!!

    var object = canvas.getActiveObject();

    objects.push(object);

    el = new fabric.Rect({
        fill: 'rgba(0,0,0,0.3)',
        originX: 'left',
        originY: 'top',
        stroke: '#ccc',
        strokeDashArray: [2, 2],
        opacity: 1,
        width: 1,
        height: 1,
        borderColor: '#36fd00',
        cornerColor: 'green',
        hasRotatingPoint: false
    });

    el.left = canvas.getActiveObject().left;

    selection_object_left = canvas.getActiveObject().left;
    selection_object_top = canvas.getActiveObject().top;

    el.top = canvas.getActiveObject().top;

    el.width = canvas.getActiveObject().width * canvas.getActiveObject().scaleX;
    el.height = canvas.getActiveObject().height * canvas.getActiveObject().scaleY;

    el.cropper = true;

    canvas.add(el);
    canvas.setActiveObject(el);

    cropflag = true;

});




function updateOptions(obj) {

    //update all
    $('#slider-opacity').val(obj.opacity, {
        set: true
    });

    if (obj.shadow) {
        $("#shadowify").addClass("uk-active");
    } else {
        $("#shadowify").removeClass("uk-active");
    }

    $('#objWidth').val(obj.width);
    $('#objHeight').val(obj.height);
    $('#objScaleX').val(Number(obj.scaleX).toFixed(2));
    $('#objScaleY').val(Number(obj.scaleY).toFixed(2));
    $('#objAngle').val(Number(obj.angle).toFixed(2));

    $('#objPosX').val(obj.left);
    $('#objPosY').val(obj.top);

    if (obj.getFlipX()) {
        $('#flipx').addClass("uk-active");
    } else {
        $('#flipx').removeClass("uk-active");
    }

    if (obj.getFlipY()) {
        $('#flipy').addClass("uk-active");
    } else {
        $('#flipy').removeClass("uk-active");
    }


    //update according to object type
    if (obj.text) {
        $("#textcolor").val(obj.fill);
        $("#bgcolor").val(obj.backgroundColor);
    }

    if (obj.filters) {

        //update tint
        if (obj.filters[12]) {
            var to = obj.filters[12].opacity || 0;
            var tc = obj.filters[12].color || "#000000";
        }
        $('#slider-tint').val(to, {
            set: true
        });

        $("#tint-color").spectrum("set", tc);
        $("#tint-color-value").text(tc).css("background", tc);


        $("#objWidth, #objHeight").removeAttr("disabled");

        if (obj.filters[6]) {
            var brightness = obj.filters[6].brightness;
        }
        $('#slider-brightness').val(brightness || 0, {
            set: true
        });

        if (obj.filters[5]) {
            var contrast = obj.filters[5].contrast;
        }
        $('#slider-contrast').val(contrast || 0, {
            set: true
        });

        if (obj.filters[8]) {
            var blocksize = obj.filters[8].blocksize;
        }
        $('#slider-pixelate').val(blocksize || 0, {
            set: true
        });

        if (obj.filters[14]) {
            var exposure = obj.filters[14].exposure;
        }
        $('#slider-exposure').val(exposure || 0, {
            set: true
        });

        if (obj.filters[7]) {
            var noise = obj.filters[7].noise;
        }
        $('#slider-noise').val(noise || 0, {
            set: true
        });


    } else {
        $("#objWidth, #objHeight").attr("disabled", "disabled");
    }

}



function showOptions(obj) {

    updateOptions(obj);

    $("#allOptions").show();

    if (obj.text) {
        $("#textOptions").show();
    } else {
        $("#textOptions").hide();
    }

    if (obj._element) {
        $(".imageOptions").show();
    } else {
        $(".imageOptions").hide();
    }
    canvas.calcOffset(); //instead of after render

}










var f = fabric.Image.filters;

function applyFilter(index, filter) {
    var obj = canvas.getActiveObject();
    obj.filters[index] = filter;
    obj.applyFilters(canvas.renderAll.bind(canvas));
}

//from: http://fabricjs.com/image-filters/
$("#grayscale").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(0, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(0, new f.Grayscale());
    }
});

$("#invert").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(1, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(1, new f.Invert());
    }
});

$("#sepia").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(3, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(3, new f.Sepia());
    }
});

$("#sepia2").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(4, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(4, new f.Sepia2());
    }
});

$("#blur").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(9, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(9, new f.Convolute({
            matrix: [1 / 9, 1 / 9, 1 / 9,
                1 / 9, 1 / 9, 1 / 9,
                1 / 9, 1 / 9, 1 / 9
            ]
        }));
    }
});

$("#sharpen").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(10, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(10, new f.Convolute({
            matrix: [0, -1, 0, -1, 5, -1,
                0, -1, 0
            ]
        }));
    }
});

$("#emboss").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(10, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(10, new f.Convolute({
            matrix: [1, 1, 1,
                1, 0.7, -1, -1, -1, -1
            ]
        }));
    }
});

//add shadow for all objects
$('#shadowify').on('click', function(e) {

    if (e.originalEvent) {

        var obj = canvas.getActiveObject();
        if (!obj) return;

        if ($(this).hasClass("uk-active")) {
            obj.shadow = null;
            $(this).removeClass("uk-active");
        } else {
            obj.setShadow({
                color: 'rgba(0,0,0,0.3)',
                blur: 10,
                offsetX: 10,
                offsetY: 10
            });
            $(this).addClass("uk-active");
        }
        canvas.renderAll();

    }

});

$("#slider-opacity").noUiSlider({
    start: 1,
    step: 0.1,
    connect: "lower",
    range: {
        'min': 0,
        'max': 1
    },
    serialization: {
        lower: [
            $.Link({
                target: $("#slider-opacity-value")
            })
        ]
    }
});

$("#slider-opacity").change(function() {
    canvas.getActiveObject()["opacity"] = $(this).val();
    canvas.renderAll();
});

$("#slider-brightness").noUiSlider({
    start: 0,
    step: 1,
    connect: "lower",
    range: {
        'min': -100,
        'max': 100
    },
    serialization: {
        lower: [
            $.Link({
                target: $("#slider-brightness-value")
            })
        ]
    }
});

$("#slider-brightness").change(function() {
    var v = parseFloat($(this).val()) || 0.1;
    applyFilter(6, new f.Brightness({
        brightness: v
    }));
});

$("#slider-contrast").noUiSlider({
    start: 0,
    step: 1,
    connect: "lower",
    range: {
        'min': -100,
        'max': 100
    },
    serialization: {
        lower: [
            $.Link({
                target: $("#slider-contrast-value")
            })
        ]
    }
});

$("#slider-contrast").change(function() {
    applyFilter(5, new f.Contrast({
        contrast: parseFloat($(this).val())
    }));
});

$("#slider-exposure").noUiSlider({
    start: 0,
    step: 1,
    connect: "lower",
    range: {
        'min': -100,
        'max': 100
    },
    serialization: {
        lower: [
            $.Link({
                target: $("#slider-exposure-value")
            })
        ]
    }
});

$("#slider-exposure").change(function() {
    applyFilter(14, new f.Exposure({
        exposure: parseFloat($(this).val())
    }));
});

$("#slider-pixelate").noUiSlider({
    start: 0,
    step: 1,
    connect: "lower",
    range: {
        'min': 0,
        'max': 20
    },
    serialization: {
        lower: [
            $.Link({
                target: $("#slider-pixelate-value")
            })
        ]
    }
});

$("#slider-pixelate").change(function() {
    applyFilter(8, new f.Pixelate({
        blocksize: parseFloat($(this).val()) + 1
    }));
});

$("#slider-noise").noUiSlider({
    start: 0,
    step: 1,
    connect: "lower",
    range: {
        'min': 0,
        'max': 1000
    },
    serialization: {
        lower: [
            $.Link({
                target: $("#slider-noise-value")
            })
        ]
    }
});

$("#slider-noise").change(function() {
    var v = parseFloat($(this).val()) || "0";
    applyFilter(7, new f.Noise({
        noise: v
    }));
});

$("#slider-tint").noUiSlider({
    start: 0,
    step: 0.1,
    connect: "lower",
    range: {
        'min': 0,
        'max': 1
    },
    serialization: {
        lower: [
            $.Link({
                target: $("#slider-tint-value")
            })
        ]
    }
});

$("#slider-tint").change(function() {
    applyFilter(12, new f.Tint({
        color: $("#tint-color").val(),
        opacity: parseFloat($(this).val())
    }));
});

$("#convolute").click(function() {
    var m = $('#customMatrix input').map(function() {
        return Number(this.value);
    });
    applyFilter(13, new f.Convolute({
        matrix: m
    }));
});


$("#undoConvolute").click(function() {
    applyFilter(13, new f.Convolute({
        matrix: 0
    }));
});



/* Preset Instagram Filters */
$("#nine").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(30, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(30, new f.Nine());
    }
});

$("#brannan").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(31, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(31, new f.Brannan());
    }
});

$("#gotham").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(32, false);
        if ($("#grayscale").hasClass("uk-active")) {
            $("#grayscale").trigger("click");
        }
    } else {
        $(this).addClass("uk-active");
        if (!$("#grayscale").hasClass("uk-active")) {
            $("#grayscale").trigger("click");
        }
        applyFilter(32, new f.Gotham());
    }
});

$("#hefe").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(33, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(33, new f.Hefe());
    }
});

$("#lordkelvin").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(34, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(34, new f.LordKelvin());
    }
});

$("#nashville").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(35, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(35, new f.Nashville());
    }
});

$("#xpro").click(function() {
    if ($(this).hasClass("uk-active")) {
        $(this).removeClass("uk-active");
        applyFilter(36, false);
    } else {
        $(this).addClass("uk-active");
        applyFilter(36, new f.XPRO());
    }
});


//disable drawing mode
function drawoff() {
    $("#drawtoggle").removeClass("selected");
    canvas.isDrawingMode = false;
}


//ADD SHAPE OPTIONS!!
$("#addRectangle").click(function() {
    drawoff();
    var object = new fabric.Rect({
        left: 0,
        top: 0,
        fill: '#000000',
        width: canvas.width,
        height: 100,
        opacity: 1
    });
    canvas.add(object);
    canvas.renderAll();
    canvas.setActiveObject(object);
    object.bringToFront();
});
$("#addCircle").click(function() {
    drawoff();
    var object = new fabric.Circle({
        left: Math.floor(Math.random() * canvas.width / 2) + 1,
        top: Math.floor(Math.random() * canvas.height / 2) + 1,
        fill: '#CCCCCC',
        radius: 150,
        opacity: 1
    })
    canvas.add(object);
    canvas.renderAll();
    canvas.setActiveObject(object);
    object.bringToFront();
});
$("#addCloud").click(function() {
    drawoff();

    var svg = '<?xml version="1.0"?><svg width="640" height="480" xmlns="http://www.w3.org/2000/svg"><g id="layer1"><path fill="#ffffff" stroke="#000000" stroke-width="10.856777" stroke-linejoin="round" stroke-miterlimit="4" stroke-dashoffset="0" id="path3422" d="m372.004578,10.836412c-40.388855,0 -75.427948,14.697666 -95.028412,36.403616c-18.184845,-8.672638 -40.22821,-13.916359 -64.171478,-13.916302c-61.620529,0 -111.685692,33.793919 -111.685692,75.387691c0,3.056519 0.840431,5.978012 1.365379,8.939568c-53.217186,5.731659 -94.072747,36.570053 -94.072747,74.097504c0,37.18367 40.070592,67.958542 92.570809,74.097427c-1.063759,4.174988 -1.911484,8.431519 -1.911484,12.810425c0,41.593781 50.065155,75.295532 111.685699,75.295532c30.181931,0 57.452942,-8.137878 77.552002,-21.289185c20.482758,16.445892 50.764099,27.187469 85.06131,27.187469c48.934784,0 90.072266,-21.46106 105.13205,-51.05719c12.053833,3.008789 24.905853,4.976715 38.50293,4.976715c61.620483,0 111.549133,-33.793945 111.549133,-75.387726c0,-20.915695 -12.632507,-39.796799 -33.041443,-53.453369c10.303528,-11.410339 16.657227,-24.652817 16.657227,-38.984131c0,-41.593781 -50.065186,-75.295601 -111.68576,-75.295547c-6.486664,0 -12.793732,0.480171 -18.978333,1.198105c-9.950348,-34.725868 -55.16272,-61.010603 -109.50119,-61.010603z"/><path fill="#ffffff" stroke="#000000" stroke-width="4.798749" stroke-linejoin="round" stroke-miterlimit="4" stroke-dashoffset="0" id="path3424" d="m527.2547,392.76651a41.677917,28.132536 0 1 1-83.355835,0a41.677917,28.132536 0 1 183.355835,0z"/><path fill="#ffffff" stroke="#000000" stroke-width="5.402773" stroke-linejoin="round" stroke-miterlimit="4" stroke-dashoffset="0" id="path3426" d="m570.074829,454.142914a28.928062,19.526403 0 1 1-57.85614,0a28.928062,19.526403 0 1 157.85614,0z"/></g></svg>';

    fabric.loadSVGFromString(svg, function(objects) {
        canvas.add.apply(canvas, objects);
        canvas.renderAll();
        canvas.setActiveObject(objects[0]);
        objects[0].bringToFront();
    });

});

// TEXT FUNCTIONS
$("#addText").click(function() {

    drawoff();

    var object = new fabric.IText("edit text here", {
        fontFamily: "Arial",
        lineHeight: 1,
        padding: 10,
        left: Math.floor(Math.random() * canvas.width / 2) + 1,
        top: Math.floor(Math.random() * canvas.height / 2) + 1,
        fontSize: 20,
        textAlign: "left",
        fill: "#000000"
    });
    canvas.add(object);
    canvas.renderAll();
    canvas.setActiveObject(object);
    object.bringToFront();
});


$(".dropdown-menu a").click(function() {
    $(this).parent().parent().find(".selected").removeClass("selected");
    $(this).addClass("selected");
    var obj = canvas.getActiveObject();
    var val = $(this).attr("data-edit");
    obj.setFontFamily(val);
    canvas.renderAll();
});

$(".textalign").click(function() {
    var obj = canvas.getActiveObject();
    var val = $(this).attr("data-edit");
    obj.setTextAlign(val);
    canvas.renderAll();
});


//hacking it up...
function textD(obj, replacement) {
    var textDecoration = getStyle(obj, 'textDecoration') || "";
    var len = textDecoration.length;
    var place = textDecoration.indexOf(replacement);

    //are we re applying textDecoration or changing it
    if (replacement) {

        //if its in there, remove it
        if (place > -1) {
            textDecoration = textDecoration.replace(replacement, '');
            //remove the comma too
            textDecoration = textDecoration.replace(",", '');
        } else {
            //text is not there, so add it, but make sure the comma is there!!
            if (len == 0) {
                textDecoration = replacement;
            } else {
                textDecoration = textDecoration + ',' + replacement;
            }
        }
    } else {
        //for bold and italic
        textDecoration = textDecoration || "normal";
    }

    setStyle(obj, 'textDecoration', textDecoration);
}



function setStyle(object, styleName, value) {
    if (object.setSelectionStyles && object.isEditing) {
        var style = {};
        style[styleName] = value;
        object.setSelectionStyles(style);
    } else {
        object[styleName] = value;
    }
    canvas.renderAll();
}

function getStyle(object, styleName) {
    return (object.getSelectionStyles && object.isEditing) ? object.getSelectionStyles()[styleName] : object[styleName];
}




$(".fontWeight").click(function() {
    var obj = canvas.getActiveObject();
    var isBold = getStyle(obj, 'fontWeight') === 'bold';
    setStyle(obj, 'fontWeight', isBold ? '' : 'bold');
    textD(obj);
});

$(".fontStyle").click(function() {
    var obj = canvas.getActiveObject();
    var isItalic = getStyle(obj, 'fontStyle') === 'italic';
    setStyle(obj, 'fontStyle', isItalic ? '' : 'italic');
    textD(obj);
});

$(".strikethrough").click(function() {
    var obj = canvas.getActiveObject();
    textD(obj, 'line-through');
});

$(".underline").click(function() {
    var obj = canvas.getActiveObject();
    textD(obj, 'underline');
});

$("#fontSizePlus").click(function() {
    var obj = canvas.getActiveObject();
    var size = getStyle(obj, 'fontSize');
    setStyle(obj, 'fontSize', Number(size + 1));
    //canvas.renderAll();
});
$("#fontSizeMinus").click(function() {
    var obj = canvas.getActiveObject();
    var size = getStyle(obj, 'fontSize');
    setStyle(obj, 'fontSize', Number(size - 1));
    //canvas.renderAll();
});


//lineheight
$("#lineHeightPlus").click(function() {
    var obj = canvas.getActiveObject();
    var size = getStyle(obj, 'lineHeight');
    setStyle(obj, 'lineHeight', Number(size + 0.1));
});
$("#lineHeightMinus").click(function() {
    var obj = canvas.getActiveObject();
    var size = getStyle(obj, 'lineHeight');
    setStyle(obj, 'lineHeight', Number(size - 0.1));
});

$("#textcolor").change(function() {
    var obj = canvas.getActiveObject();
    obj.setColor($(this).val());
    canvas.renderAll();
});
$("#bgcolor").change(function() {
    var obj = canvas.getActiveObject();
    obj.setBackgroundColor($(this).val());
    canvas.renderAll();
});




//DRAWING
if (fabric.PatternBrush) {
    var vLinePatternBrush = new fabric.PatternBrush(canvas);
    vLinePatternBrush.getPatternSrc = function() {

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
    };

    var hLinePatternBrush = new fabric.PatternBrush(canvas);
    hLinePatternBrush.getPatternSrc = function() {

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
    };

    var squarePatternBrush = new fabric.PatternBrush(canvas);
    squarePatternBrush.getPatternSrc = function() {

        var squareWidth = 10,
            squareDistance = 2;

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
        var ctx = patternCanvas.getContext('2d');

        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, squareWidth, squareWidth);

        return patternCanvas;
    };

    var diamondPatternBrush = new fabric.PatternBrush(canvas);
    diamondPatternBrush.getPatternSrc = function() {

        var squareWidth = 10,
            squareDistance = 5;
        var patternCanvas = fabric.document.createElement('canvas');
        var rect = new fabric.Rect({
            width: squareWidth,
            height: squareWidth,
            angle: 45,
            fill: this.color
        });

        var canvasWidth = rect.getBoundingRectWidth();

        patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
        rect.set({
            left: canvasWidth / 2,
            top: canvasWidth / 2
        });

        var ctx = patternCanvas.getContext('2d');
        rect.render(ctx);

        return patternCanvas;
    };

}


$("#drawtoggle").click(function() {
    var c = canvas.isDrawingMode;

    if (c === true) {
        $("#drawOptions").hide();
        $(this).removeClass("selected");
        canvas.isDrawingMode = false;
    } else {
        $("#drawOptions").show();
        $(this).addClass("selected");
        canvas.isDrawingMode = true;
    }
});

$('#drawing-color').change(function() {
    canvas.freeDrawingBrush.color = $(this).val();
});


$("#slider-line").noUiSlider({
    start: 1,
    step: 1,
    connect: "lower",
    range: {
        'min': 1,
        'max': 150
    },
    serialization: {
        lower: [
            $.Link({
                target: $("#slider-line-value")
            })
        ]
    }
});

$("#slider-line").change(function() {
    canvas.freeDrawingBrush.width = parseInt($(this).val(), 10);
});


$("#drawing-mode-selector a").click(function() {
    $(this).parent().parent().find(".selected").removeClass("selected");
    $(this).addClass("selected");
    var v = $(this).attr("data-edit");

    if (v === 'hline') {
        canvas.freeDrawingBrush = vLinePatternBrush;
    } else if (v === 'vline') {
        canvas.freeDrawingBrush = hLinePatternBrush;
    } else if (v === 'square') {
        canvas.freeDrawingBrush = squarePatternBrush;
    } else if (v === 'diamond') {
        canvas.freeDrawingBrush = diamondPatternBrush;
    } else {
        canvas.freeDrawingBrush = new fabric[v + 'Brush'](canvas);
    }

    if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = $('#drawing-color').val();
        canvas.freeDrawingBrush.width = parseInt($('#slider-line').val(), 10) || 1;
    }
});


//HISTORY
var current;
var list = [];
var state = [];
var index = 0;
var index2 = 0;
var action = false;
var refresh = true;

function trackHistory(e) {
    list = [];
    State = [];
    index = 0;
    index2 = 0;
    action = false;
    refresh = true;

    var object = e.target;

    if (action === true) {
        state = [state[index2]];
        list = [list[index2]];

        action = false;
        index = 1;
    }
    object.saveState();

    state[index] = JSON.stringify(object.originalState);
    list[index] = object;
    index++;
    index2 = index - 1;

    refresh = true;
}


function saveit(object) {
    if (action === true) {
        state = [state[index2]];
        list = [list[index2]];

        action = false;
        index = 1;
    }

    object.saveState();

    state[index] = JSON.stringify(object.originalState);
    list[index] = object;
    index++;
    index2 = index - 1;

    refresh = true;
}

function undo() {
    if (index <= 0) {
        index = 0;
        return;
    }

    if (refresh === true) {
        index--;
        refresh = false;
    }

    index2 = index - 1;
    current = list[index2];
    current.setOptions(JSON.parse(state[index2]));

    index--;
    current.setCoords();
    canvas.renderAll();

    updateOptions(current);

    action = true;
}

function redo() {
    action = true;
    if (index >= state.length - 1) {
        return;
    }

    index2 = index + 1;
    current = list[index2];
    current.setOptions(JSON.parse(state[index2]));

    index++;
    current.setCoords();
    canvas.renderAll();
}

$('#undo').click(function() {
    undo();
});
$('#redo').click(function() {
    redo();
});






$("body").bind("paste", function(ev) {
    var $this = $(this);
    var original = ev.originalEvent;
    var file = original.clipboardData.items[0].getAsFile();

    var imagefile = URLObj.createObjectURL(file);
    //console.log(imagefile);

    fabric.Image.fromURL(imagefile, function(oImg) {
        add(oImg, 0, 0);
    });
});






//spectrum colorpicker
var colorpick = function(e) {
    var rgb = this.style.background;
    $(".sp-active").prev().spectrum("set", rgb);
    $(".sp-active").prev().trigger("change");
};

$(".colorp").spectrum({
    preferredFormat: "hex",
    color: "#000000",
    showInput: true,
    showInitial: true,
    clickoutFiresChange: true,
    showButtons: true,
    allowEmpty: true,
    show: function(color) {
        $("canvas").css("cursor", "pointer"); //eye dropper
        $("body").on("mousemove", ".swatch", colorpick);
    },
    hide: function(color) {
        $("canvas").css("cursor", "initial");
        $("body").off("mousemove", ".swatch", colorpick);
    }
});


//spectrum colorpicker
$(".noempty").spectrum({
    preferredFormat: "hex",
    color: "#000000",
    showInput: true,
    showInitial: true,
    clickoutFiresChange: true,
    showButtons: true,
    change: function(color) {
        if (this.id == "tint-color") {
            var hex = color.toHexString();

            $("#tint-color-value").text(hex).css("background", hex);

            applyFilter(12, new f.Tint({
                color: hex,
                opacity: parseFloat($("#slider-tint").val())
            }));
        }
    },
    show: function(color) {
        $("canvas").css("cursor", "pointer"); //eye dropper
        $("body").on("mousemove", ".swatch", colorpick);
    },
    hide: function(color) {
        $("canvas").css("cursor", "initial");
        $("body").off("mousemove", ".swatch", colorpick);
    }
});

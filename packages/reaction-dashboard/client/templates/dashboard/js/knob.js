    //--------------------- Knob ------------------------//
    if (jQuery().knob) {
        $(".knob").knob({
            'dynamicDraw': true,
            'thickness': 0.2,
            'tickColorizeValues': true,
            'skin': 'tron'
        });

        $(".circle-stats-item > input").knob({
            'readOnly': true,
            'width': 120,
            'height': 120,
            'dynamicDraw': true,
            'thickness': 0.2,
            'tickColorizeValues': true,
            'skin':'tron'
        });
    }
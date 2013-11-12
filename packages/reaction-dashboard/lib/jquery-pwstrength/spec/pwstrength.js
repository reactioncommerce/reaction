describe("jquery.pwstrength", function() {
    function initPasswordField() {
        $('form').html('<input type="password" id="field" data-indicator="indicator"><div id="indicator"><div class="label"></div></div>');
        return $('#field').pwstrength();
    }
    
    it("detects very weak passwords", function() {
        expect($.pwstrength('abcd')).toEqual(0);
    });
    
    it("detects weak passwords", function() {
        expect($.pwstrength('abdge123')).toEqual(1);
    });
    
    it("detects mediocre passwords", function() {
        expect($.pwstrength('Ab12Degf')).toEqual(2);
    });
    
    it("detects strong passwords", function() {
        expect($.pwstrength('@b12Degf')).toEqual(3);
    });
    
    it("detects very strong passwords", function() {
        expect($.pwstrength('@b12De Fghbe#')).toEqual(4);
        expect($.pwstrength('@b12DeFghbe234567#')).toEqual(4);
    });
    
    it("updates the strength indicator", function() {
        var $field = initPasswordField(), $indicator = $('#indicator');
        
        $field.val('abcd');
        $field.keyup();
        expect($indicator.hasClass('pw-very-weak')).toBeTruthy();
        expect($indicator.find('.label').html()).toEqual('very weak');
        
        $field.val('@b12De Fghbe#');
        $field.keyup();
        expect($indicator.hasClass('pw-very-strong')).toBeTruthy();
        expect($indicator.hasClass('pw-very-weak')).toBeFalsy();
        expect($indicator.find('.label').html()).toEqual('very strong');
    });
});
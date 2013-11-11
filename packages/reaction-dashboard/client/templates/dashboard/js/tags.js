    //----------------------- Tags Input -------------------------//
    if (jQuery().tagsInput) {
        $('#tag-input-1').tagsInput({
            width: 'auto',
            'onAddTag': function (tag) {
                alert('New tag added: ' + tag);
            },
        });
        $('#tag-input-2').tagsInput({
            width: 240
        });
    }
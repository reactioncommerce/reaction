# Product test plan

## Products grid

### Non-admin user
#### Interaction with product cards
* When you click on product **image** you should be redirected to PDP (Product Details Page).
* When you click on product **price** you should be redirected to PDP.

### Admin user
#### Interaction with product cards
* When you click on product **image** you should be redirected to PDP.
* When you click on product **price** you should be redirected to PDP.
* When you click on “More Options” button, you should see pop-up menu on the right side of a page (`ActionBar`).
* By pressing “shift” or “ctrl” + left mouse button (LMB) click on a card you should see appearing `ActionBar`. Also, you should see a border around card. Within `ActionBar` “Product” section you should see Product image and title with price.
* By pressing “shift” or “ctrl” + left mouse button  click on several cards you should see how additional products you selected are added to “Product” section of `ActionBar`.
* By clicking LMB + “ctrl” on selected Product card you should see how this card become unselected. `ActionBar` will not close automatically. You should see a message within it “No selected products....”
* When “Publish” button has strikethrough eye and you click on it, you should see an alert with text “_ Product name _ is now visible”
* When “Publish” button has just an eye and you click on it, you should see an alert with text “_ Product name _ is now hidden”
* When you have several products on a grid, you could drag a product card by holding left-mouse-button (LMB) in pressed state and move it relatively another product cards. When you drop it in new location, product card should be in it. Try to reload the page by pressing “F5”. Product should be in a new position.

#### Interaction with right side action bar
* When selected one or several products after click on `ActionBar` “Publish” button you should see alert against each of selected products with “is now visible/hidden” notification, also product card “Publish” buttons should change their icons (eye/strikethrough eye).
* When you click on “Duplicate Product” button you should see appearance of a new product on a grid. It should have the same images, price as original and it should have a title “original product title + -copy” or “original product title + -copy-N” if original was a copy of some other product, there N is a number of copy.
* When several products are selected clicking on “Duplicate Product” button should create a copy of each of those products.
* When you click on “Delete Product” button, you should see a dialog with confirmation “Delete this product?”. By choosing “OK” you should see how product card will disappear and alert will pop-up with message: “Deleted _ Product_name _ ”.
* The same is true when several products selected.
* When you click on product title inside “Product” section, you should be redirected to product page.
* If you browser opened wide enough and you click to one of three elements in “Size” section, you should see how product card change it's sizes. Left element – default size; middle – two size from default; right element – product card will fill all grid width. In a third case product title and price should be moved into blue block in a left bottom corner of a card.

## Product Details Page (PDP)
### Non-admin user

#### Images
* If you see several images on the page – one big and else small under the big one, you could move your mouse cursor over one of the small image. At the moment you hover a small image, it should replace the big one.

#### Tags
* If product has tags you should see them under the **Tags** header. If you click on one of these tags you should be redirected to this tag's page. There you could see all products with the same tag.

#### Options
* Product could have variants. Variants could have options. You could see variant as a long (maybe colored) block under the **Options** header. If product has several variants you could switch between them by clicking on colored blocks. If variants have different images, you should see how images change.
* If variant has options you should see it as small blocks with title under phrase “There are more options available for this selection.”. When you click on option you should see how images change (if option has individual images) and how price changes under the product title. Option block should become pressed.

#### Add to cart
* If you visit to a product page and product has variants and options, you'll need to select option (if variant has it) or select variant (if it has no options) before clicking to “Add to cart” button, otherwise you should see an alert message warning. Selected variant should have a border around it.
* You could change the number of items, which you want to add to cart by the help of input element inside “Add to cart” button. The maximum number of items that you can add should be limited by system. When you type something like 999999, it should be transformed to something like 15, where 15 – the number of items this variant or option has.
* It should not be allowed to enter number with minus sign to this field.
* When you click to “Add to cart” button with selected variant or option, you should see how this variant or options were added to you cart. You should see a green notification block in a top left corner of a page with the number you choose and the title of selected variant/option.
* When you order all items from variants/options in this product, you should see a notification that item is “Sold out!”
* When you add to cart all product's variants and options and switching to product grid page, you should see a label within product image “Sold out!”

### Admin user
#### Product management
* If you see a link “Make invisible” near “Product management:” on top of the page and you click on it, you should see an alert with text “This product is not visible to customers....”.
* If you see a colored alert on top of a page with link “You can make it visible” and you click on it, the alert should go away and you should see “Product management Make invisible”.
* Near the “Product management” you could see a “Delete” link. If you click on it, you should see a confirmation request window. If you press “OK”, you should be redirected to the products grid page. And this product should be removed. You should see an alert with text “Deleted _ Product name _”
#### Title
* When you click inside top product title you could change it. After you finished your changes click somewhere out of this field and you should see how URL change against you changes.
* When you click on a page title (second big title) you could edit it. After you finished and click outside it you should see a green blink inside this field. Your changes should be saved.

#### Images
* You could add images to each of product variants or options. To do that you need to select variant/option and then click on a image or on a “Drop file to upload” block. Also you could drop files from outside of browser. All images you have upload should be displayed in this section.
* You can't add images to product itself. Try to remove all variants by click on variant “Edit” button, and then on “Remove” button. When you'll remove all variants you should see “+ Create Variant” phrase. Try to add an image. You should see an alert “Please, create new Variant first.”
* You could change images order by drag'n'drop them. Every change should be saved automatically.

#### Tags
* You could add tags to product by putting cursor in a clean field on **Tags** section and typing tag name. If tag exist, you should see it. You could select existed tag or add new by clicking outside of this field.
* You could change tags order by dragging them.
* When you click on remove icon on tag, it should be removed.
* When you click on bookmark icon on tag, it's URL should change on a new one – tag name.
* When you click on active bookmark icon on tag, product URL should change to product title.

#### Details
* When you add text to both clean fields inside **Details** section and click outside of this fields, you should see how new details will appears within this section table.
* When you click on remove icon near one of a detail row, it should be removed.

#### Description
* When you click on “Product Vendor” field, you can edit it. Changes should be saved after you click outside of this field.
* When you click on a product description field you can edit it. Changes should be saved after you click outside of this field.

#### Options
* You can see an edit menu of each variant by clicking on “Edit” button, which is from the right side of variant block. By click on this “Edit” button you should see a block with two sections: variant settings and options list with their settings.
* By editing variant Label field you should change variant label. You should see changes immediately within variant block.
* Variant block has a badge with number, which represents the quantity for this variant (if it has no options) or sum of all options quantities for this variant.
* TAXABLE – NOT READY
* By enabling “Inventory Tracking” you allow system to notify when variant will be sold out, or when it's options' quantity will be lower then threshold, which you set in “Warn @” field.
* By enabling “Deny when out of stock” you prevent variant to be ordered if it or it variants is out of stock.
* If variant has options you could edit only “Weight”, “MSRP” and “Warn @” fields.
* If variant has no options you can edit all it's fields.
* When you click on “Add Option” button, you should see an appearance of a new option.
* When you click on “Duplicate” button, you should see an appearance of a clone of this variant. It should be with the same images, but without titles.
* When you click on “Remove” button, first you should see confirmation request and then, when you press “OK” you should see how this variant will be removed.
* If option is newly created and when you edit option field “Option”, you should see how option block appears with this text. (This is old logic)
* When you edit “Label” field you should see how this text appears within option block (new logic).
* When you add numbers to the “Quantity” field you should see how variant block changes it's badge quantity number on a left side of variant block. This number is a sum of all options' quantities. (if options exist for this variant)
* When you fill price field, you should see how product price field reflects to you changes reactively.
* When you click on remove icon from the right side of an option row, you should see confirmation request and after you press “OK”, you should see how option will be removed without any alerts.
* You could change variants order by dragging them.

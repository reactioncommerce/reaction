ImportProducts = {};

ImportProducts.letterSizeMap = {
  'extra small': 'XS',
  'small': 'S',
  'medium': 'M',
  'large': 'L',
  'extra large': 'XL',
  'extra extra large': 'XXL'
};

ImportProducts.paddedNumber = function (number, len = 4, character = '0') {
  numStr = number + ''; // Ensure number is a string;
  if (numStr.length >= len) {
    return numStr;
  }
  return new Array(len - numStr.length + 1).join(character) + numStr;
};

ImportProducts.stripTags = function (string) {
  return string.replace(/(<([^>]+)>)/ig, '');
};

ImportProducts.keyify = function (string) {
  let keyifiedString = string.replace(/([\W\/])/ig, '');
  keyifiedString = keyifiedString[0].toLowerCase() + keyifiedString.substr(1);
  return keyifiedString;
};

ImportProducts.handleize = function (string) {
  let handleizeString = string.replace(/([\W\/])/ig, '-');
  return handleizeString.toLowerCase();
};


ImportProducts.letterSize = function (size) {
  let lowerCaseSize = size.toLowerCase().trim();
  if (ImportProducts.letterSizeMap[lowerCaseSize]) {
    return ImportProducts.letterSizeMap[lowerCaseSize];
  }
  // if we don't find a match - return size as is
  return size;
};

ImportProducts.determineProductType = function (productType) {
  if (productType === 'Socks'
  || productType === 'Baselayer Top'
  || productType === 'Baselayer Bottom') {
    return 'simple';
  }
  return 'rental';
};

ImportProducts.isAlphaSizing = function (size) {
  return /^([A-Za-z]+\W?){1,3}$/.test(size);
};

ImportProducts.generateSku = function (product, color, size) {
  const prodSection = product.vendor.substr(0, 2).toUpperCase() + product.title.substr(0, 2).toUpperCase();
  const colorWords = color.match(/[A-Za-z\d]\w+/g);
  let colorSection = '';
  if (colorWords.length > 1) {
    _.each(colorWords, function (word) {
      colorSection = colorSection + word[0];
    });
  } else {
    colorSection = colorWords[0].substr(0, 2).toUpperCase();
  }

  const sku = prodSection + '-' + colorSection + '-' + ImportProducts.letterSize(size);
  return sku;
};

ImportProducts.schemaIdAutoValue = function () {
  if (this.value || this.isUpdate && Meteor.isServer || this.isUpsert && Meteor.isServer) {
    return this.value;
  } else if (Meteor.isServer || Meteor.isClient && this.isInsert) {
    return Random.id();
  }
  return this.unset();
};

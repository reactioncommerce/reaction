![JQVMap](http://jqvmap.com/img/logo.png "JQVMap")

This project is a heavily modified version of [jVectorMap](https://github.com/bjornd/jvectormap).  I chose to start fresh rather than fork their project as my intentions were to take it in such a different direction that it would become incompatibale with the original source, rendering it near impossible to merge our projects together without extreme complications.

jQuery Vector Map
======

To get started, all you need to do is include the JavaScript and CSS files for the map you want to load.  Here is a sample HTML page for loading the World Map with default settings:

	<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	  <head>
	    <title>JQVMap - World Map</title>
    
	    <link href="../jqvmap/jqvmap.css" media="screen" rel="stylesheet" type="text/css" />
    
	    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
	    <script src="../jqvmap/jquery.vmap.js" type="text/javascript"></script>
	    <script src="../jqvmap/maps/jquery.vmap.world.js" type="text/javascript"></script>
    
		<script type="text/javascript">
		jQuery(document).ready(function() {
			jQuery('#vmap').vectorMap({ map: 'world_en' });
		});
		</script>
	  </head>
	  <body>
	    <div id="vmap" style="width: 600px; height: 400px;"></div>
	  </body>
	</html>

Making it Pretty
======

While initializing a map you can provide parameters to change its look and feel.

	jQuery('#vmap').vectorMap(
	{
	    map: 'world_en',
	    backgroundColor: '#a5bfdd',
	    borderColor: '#818181',
	    borderOpacity: 0.25,
	    borderWidth: 1,
	    color: '#f4f3f0',
	    enableZoom: true,
	    hoverColor: '#c9dfaf',
	    hoverOpacity: null,
	    normalizeFunction: 'linear',
	    scaleColors: ['#b6d6ff', '#005ace'],
	    selectedColor: '#c9dfaf',
	    selectedRegion: null,
	    showTooltip: true,
	    onRegionClick: function(element, code, region)
	    {
	        var message = 'You clicked "'
	            + region 
	            + '" which has the code: '
	            + code.toUpperCase();
             
	        alert(message);
	    }
	});

Configuration Settings
------

**map** *'world_en'*

Map you want to load. Must include the javascript file with the name of the map you want. Available maps with this library are world_en, usa_en, europe_en and germany_en

**backgroundColor** *'#a5bfdd'*

Background color of map container in any CSS compatible format.

**borderColor** *'#818181'*

Border Color to use to outline map objects

**borderOpacity** *0.5*

Border Opacity to use to outline map objects ( use anything from 0-1, e.g. 0.5, defaults to 0.25 )

**borderWidth** *3*

Border Width to use to outline map objects ( defaults to 1 )

**color** *'#f4f3f0'*

Color of map regions.

**colors**

Colors of individual map regions. Keys of the colors objects are country codes according to ISO 3166-1 alpha-2 standard. Keys of colors must be in lower case.

**enableZoom** *boolean*

Whether to Enable Map Zoom ( true or false, defaults to true)

**hoverColor** *'#c9dfaf'*

Color of the region when mouse pointer is over it.

**hoverOpacity** *0.5*

Opacity of the region when mouse pointer is over it.

**normalizeFunction** *'linear'*

This function can be used to improve results of visualizations for data with non-linear nature. Function gets raw value as the first parameter and should return value which will be used in calculations of color, with which particular region will be painted.

**scaleColors** *['#b6d6ff', '#005ace']*

This option defines colors, with which regions will be painted when you set option values. Array scaleColors can have more then two elements. Elements should be strings representing colors in RGB hex format.

**selectedRegion** *'mo'*

This is the Region that you are looking to have preselected (two letter ISO code, defaults to null )

	WORLD
	------------------------------
	AE = United Arab Emirates
	AF = Afghanistan
	AG = Antigua and Barbuda
	AL = Albania
	AM = Armenia
	AO = Angola
	AR = Argentina
	AT = Austria
	AU = Australia
	AZ = Azerbaijan
	BA = Bosnia and Herzegovina
	BB = Barbados
	BD = Bangladesh
	BE = Belgium
	BF = Burkina Faso
	BG = Bulgaria
	BI = Burundi
	BJ = Benin
	BN = Brunei Darussalam
	BO = Bolivia
	BR = Brazil
	BS = Bahamas
	BT = Bhutan
	BW = Botswana
	BY = Belarus
	BZ = Belize
	CA = Canada
	CD = Congo
	CF = Central African Republic
	CG = Congo
	CH = Switzerland
	CI = Cote d'Ivoire
	CL = Chile
	CM = Cameroon
	CN = China
	CO = Colombia
	CR = Costa Rica
	CU = Cuba
	CV = Cape Verde
	CY = Cyprus
	CZ = Czech Republic
	DE = Germany
	DJ = Djibouti
	DK = Denmark
	DM = Dominica
	DO = Dominican Republic
	DZ = Algeria
	EC = Ecuador
	EE = Estonia
	EG = Egypt
	ER = Eritrea
	ES = Spain
	ET = Ethiopia
	FI = Finland
	FJ = Fiji
	FK = Falkland Islands
	FR = France
	GA = Gabon
	GB = United Kingdom
	GD = Grenada
	GE = Georgia
	GF = French Guiana
	GH = Ghana
	GL = Greenland
	GM = Gambia
	GN = Guinea
	GQ = Equatorial Guinea
	GR = Greece
	GT = Guatemala
	GW = Guinea-Bissau
	GY = Guyana
	HN = Honduras
	HR = Croatia
	HT = Haiti
	HU = Hungary
	ID = Indonesia
	IE = Ireland
	IL = Israel
	IN = India
	IQ = Iraq
	IR = Iran
	IS = Iceland
	IT = Italy
	JM = Jamaica
	JO = Jordan
	JP = Japan
	KE = Kenya
	KG = Kyrgyz Republic
	KH = Cambodia
	KM = Comoros
	KN = Saint Kitts and Nevis
	KP = North Korea
	KR = South Korea
	KW = Kuwait
	KZ = Kazakhstan
	LA = Lao People's Democratic Republic
	LB = Lebanon
	LC = Saint Lucia
	LK = Sri Lanka
	LR = Liberia
	LS = Lesotho
	LT = Lithuania
	LV = Latvia
	LY = Libya
	MA = Morocco
	MD = Moldova
	MG = Madagascar
	MK = Macedonia
	ML = Mali
	MM = Myanmar
	MN = Mongolia
	MR = Mauritania
	MT = Malta
	MU = Mauritius
	MV = Maldives
	MW = Malawi
	MX = Mexico
	MY = Malaysia
	MZ = Mozambique
	NA = Namibia
	NC = New Caledonia
	NE = Niger
	NG = Nigeria
	NI = Nicaragua
	NL = Netherlands
	NO = Norway
	NP = Nepal
	NZ = New Zealand
	OM = Oman
	PA = Panama
	PE = Peru
	PF = French Polynesia
	PG = Papua New Guinea
	PH = Philippines
	PK = Pakistan
	PL = Poland
	PT = Portugal
	PY = Paraguay
	QA = Qatar
	RE = Reunion
	RO = Romania
	RS = Serbia
	RU = Russian Federationß
	RW = Rwanda
	SA = Saudi Arabia
	SB = Solomon Islands
	SC = Seychelles
	SD = Sudan
	SE = Sweden
	SI = Slovenia
	SK = Slovakia
	SL = Sierra Leone
	SN = Senegal
	SO = Somalia
	SR = Suriname
	ST = Sao Tome and Principe
	SV = El Salvador
	SY = Syrian Arab Republic
	SZ = Swaziland
	TD = Chad
	TG = Togo
	TH = Thailand
	TJ = Tajikistan
	TL = Timor-Leste
	TM = Turkmenistan
	TN = Tunisia
	TR = Turkey
	TT = Trinidad and Tobago
	TW = Taiwan
	TZ = Tanzania
	UA = Ukraine
	UG = Uganda
	US = United States of America
	UY = Uruguay
	UZ = Uzbekistan
	VE = Venezuela
	VN = Vietnam
	VU = Vanuatu
	YE = Yemen
	ZA = South Africa
	ZM = Zambia
	ZW = Zimbabwe
 
	USA
	------------------------------
	AK = Alaska
	AL = Alabama
	AR = Arkansas
	AZ = Arizona
	CA = California
	CO = Colorado
	CT = Connecticut
	DC = District of Columbia
	DE = Delaware
	FL = Florida
	GA = Georgia
	HI = Hawaii
	IA = Iowa
	ID = Idaho
	IL = Illinois
	IN = Indiana
	KS = Kansas
	KY = Kentucky
	LA = Louisiana
	MA = Massachusetts
	MD = Maryland
	ME = Maine
	MI = Michigan
	MN = Minnesota
	MO = Missouri
	MS = Mississippi
	MT = Montana
	NC = North Carolina
	ND = North Dakota
	NE = Nebraska
	NH = New Hampshire
	NJ = New Jersey
	NM = New Mexico
	NV = Nevada
	NY = New York
	OH = Ohio
	OK = Oklahoma
	OR = Oregon
	PA = Pennsylvania
	RI = Rhode Island
	SC = South Carolina
	SD = South Dakota
	TN = Tennessee
	TX = Texas
	UT = Utah
	VA = Virginia
	VT = Vermont
	WA = Washington
	WI = Wisconsin
	WV = West Virginia
	WY = Wyoming
 
	EUROPE
	------------------------------
	AD = Andorra
	AL = Albania
	AM = Armenia
	AT = Austria
	AZ = Azerbaijan
	BA = Bosnia and Herzegovina
	BE = Belgium
	BG = Bulgaria
	BY = Belarus
	CH = Switzerland
	CY = Cyprus
	CZ = Czech Republic
	DE = Germany
	DK = Denmark
	DZ = Algeria
	EE = Estonia
	ES = Spain
	FI = Finland
	FR = France
	GB = United Kingdom
	GE = Georgia
	GL = Greenland
	GR = Greece
	HR = Croatia
	HU = Hungary
	IE = Ireland
	IL = Israel
	IQ = Iraq
	IR = Iran
	IS = Iceland
	IT = Italy
	JO = Jordan
	KZ = Kazakhstan
	LB = Lebanon
	LI = Liechtenstein
	LT = Lithuania
	LU = Luxembourg
	LV = Latvia
	MA = Morocco
	MC = Monaco
	MD = Moldova
	ME = Montenegro
	MK = Macedonia
	MT = Malta
	NL = Netherlands
	NO = Norway
	PL = Poland
	PT = Portugal
	RO = Romania
	RU = Russian Federation
	SA = Saudi Arabia
	SE = Sweden
	SI = Slovenia
	SK = Slovakia
	SM = San Marino
	SR = Suriname
	SY = Syrian Arab Republic
	TM = Turkmenistan
	TN = Tunisia
	TR = Turkey
	UA = Ukraine
 
	GERMANY
	------------------------------
	BB = Brandenburg
	BE = Berlin
	BW = Baden-WÃrttemberg
	BY = Bayern
	HB = Bremen
	HE = Hessen
	HH = Hamburg
	MV = Mecklenburg-Vorpommern
	NI = Niedersachsen
	NW = Nordrhein-Westfalen
	RP = Rheinland-Pfalz
	SH = Schleswig-Holstein
	SL = Saarland
	SN = Sachsen
	ST = Sachsen-Anhalt
	TH = ThÃri

	RUSSIA
	------------------------------
	CH = Chukotka Autonomous Okrug
	KA = Kamchatka Krai
	MA = Magadan Oblast
	SA = Sakha Republic
	AM = Amur Oblast
	PR = Primorsky Krai
	EU = Jewish Autonomous Oblast
	HA = Khabarovsk Krai
	SH = Sakhalin Oblast
	OM = Omsk Oblast
	NV = Novosibirsk Oblast
	AL = Altai Krai
	LT = Altai Republic
	TV = Tuva Republic
	HK = Republic of Khakassia
	KM = Kemerovo Oblast
	TM = Tomsk Oblast
	ZB = Zabaykalsky Krai
	BR = Buryat Republic
	IR = Irkutsk Oblast
	KR = Krasnoyarsk Krai
	YA = Yamalo-Nenets Autonomous Okrug
	HT = Khanty–Mansi Autonomous Okrug
	TU = Tyumen Oblast
	KU = Kurgan Oblast
	CL = Chelyabinsk Oblast
	SV = Sverdlovsk Oblast
	AR = Arkhangelsk Oblast
	NE = Nenets Autonomous Okrug
	KO = Komi Republic
	MU = Murmansk Oblast
	VO = Vologda Oblast
	NO = Novgorod Oblast
	PS = Pskov Oblast
	LE = Leningrad Oblast
	KL = Republic of Karelia
	KN = Kaliningrad Oblast
	DA = Republic of Dagestan
	ST = Stavropol Krai
	SO = Republic of North Ossetia–Alania
	KB = Kabardino-Balkar Republic
	KH = Karachay–Cherkess Republic
	CC = Chechen Republic
	IN = Republic of Ingushetia			
	AD = Republic of Adygea
	KS = Krasnodar Krai
	RO = Rostov Oblast
	KK = Republic of Kalmykia
	AS = Astrakhan Oblast
	VL = Volgograd Oblast
	TR = Tver Oblast
	SM = Smolensk Oblast
	BN = Bryansk Oblast
	KY = Kursk Oblast
	BL = Belgorod Oblast
	OR = Oryol Oblast
	KJ = Kaluga Oblast
	TL = Tula Oblast
	LP = Lipetsk Oblast
	MC = Moscow Oblast
	RZ = Ryazan Oblast
	TB = Tambov Oblast
	VM = Vladimir Oblast
	IV = Ivanovo Oblast
	YR = Yaroslavl Oblast
	KT = Kostroma Oblast
	NN = Nizhny Novgorod Oblast
	MR = Republic of Mordovia
	PZ = Penza Oblast
	SR = Saratov Oblast
	SS = Samara Oblast
	OB = Orenburg Oblast
	BS = Republic of Bashkortostan
	UL = Ulyanovsk Oblast
	CU = Chuvash Republic
	TA = Republic of Tatarstan
	ML = Mari El Republic
	UD = Udmurt Republic
	KI = Kirov Oblast
	PE = Perm Krai
	VN = Voronezh Oblast

**showTooltip** *boolean*

Whether to show Tooltips on Mouseover ( true or false, defaults to true)

**onLabelShow** *function(event, label, code)*

Callback function which will be called before label is shown. Label DOM object and country code will be passed to the callback as arguments.

**onRegionOver** *function(event, code, region)*

Callback function which will be called when the mouse cursor enters the region path. Country code will be passed to the callback as argument.

**onRegionOut** *function(event, code, region)*

Callback function which will be called when the mouse cursor leaves the region path. Country code will be passed to the callback as argument.

**onRegionClick** *function(event, code, region)*

Callback function which will be called when the user clicks the region path. Country code will be passed to the callback as argument. This callback may be called while the user is moving the map. If you need to distinguish between a "real" click and a click resulting from moving the map, you can inspect **$(event.currentTarget).data('mapObject').isMoving**.

Dynamic Updating
======

Most of the options can be changed after initialization using the following code:

	jQuery('#vmap').vectorMap('set', 'colors', {us: '#0000ff'});

Instead of colors can be used any parameter except callbacks. Callbacks can be added and deleted using standard jQuery patterns of working with events.
You can define callback function when you initialize JQVMap:

	jQuery('#vmap').vectorMap(
	{
	    onLabelShow: function(event, label, code)
	    {
     
	    },
	    onRegionOver: function(event, code, region)
	    {
     
	    },
	    onRegionOut: function(event, code, region)
	    {
     
	    },
	    onRegionClick: function(event, code, region)
	    {
     
	    }
	});

Or later using standard jQuery mechanism:

	jQuery('#vmap').bind('labelShow.jqvmap', 
	    function(event, label, code)
	    {
     
	    }
	);
	jQuery('#vmap').bind('regionMouseOver.jqvmap', 
	    function(event, code, region)
	    {
     
	    }
	);
	jQuery('#vmap').bind('regionMouseOut.jqvmap',
	    function(event, code, region)
	    {
     
	    }
	);
	jQuery('#vmap').bind('regionClick.jqvmap',
	    function(event, code, region)
	    {
     
	    }
	);

Consider that fact that you can use standard features of jQuery events like event.preventDefault() or returning false from the callback to prevent default behavior of JQVMap (showing label or changing country color on hover). In the following example, when user moves mouse cursor over Canada label won't be shown and color of country won't be changed. At the same label for Russia will have custom text.

	jQuery('#vmap').vectorMap(
	{
	    onLabelShow: function(event, label, code)
	    {
	        if (code == 'ca')
	        {
	            event.preventDefault();
	        }
	        else if (code == 'ru')
	        {
	            label.text('Bears, vodka, balalaika');
	        }
	    },
	    onRegionOver: function(event, code)
	    {
	        if (code == 'ca')
	        {
	            event.preventDefault();
	        }
	    },
	});

Data Visualization
======

Here I want to demonstrate how visualization of some geographical-related data can be done using JQVMap. Let's visualize information about GDP in 2010 for every country. At first we need some data. Let it be site of International Monetary Fond. There we can get information in xsl format, which can be converted first to csv and then to json with any scripting language. Now we have file gdp-data.js with such content (globals are evil, I know, but just for the sake of simplification):

	var sample_data = {"af":16.63,"al":11.58,"dz":158.97,...};

Then connect it to the page and add some code to make visualization:

	var max = 0,
	    min = Number.MAX_VALUE,
	    cc,
	    startColor = [200, 238, 255],
	    endColor = [0, 100, 145],
	    colors = {},
	    hex;
     
	//find maximum and minimum values
	for (cc in gdpData)
	{
	    if (parseFloat(gdpData[cc]) > max)
	    {
	        max = parseFloat(gdpData[cc]);
	    }
	    if (parseFloat(gdpData[cc]) < min)
	    {
	        min = parseFloat(gdpData[cc]);
	    }
	}
 
	//set colors according to values of GDP
	for (cc in gdpData)
	{
	    if (gdpData[cc] > 0)
	    {
	        colors[cc] = '#';
	        for (var i = 0; i<3; i++)
	        {
	            hex = Math.round(startColor[i] 
	                + (endColor[i] 
	                - startColor[i])
	                * (gdpData[cc] / (max - min))).toString(16);
             
	            if (hex.length == 1)
	            {
	                hex = '0'+hex;
	            }
             
	            colors[cc] += (hex.length == 1 ? '0' : '') + hex;
	        }
	    }
	}
 
	//initialize JQVMap
	jQuery('#vmap').vectorMap(
	{
	    colors: colors,
	    hoverOpacity: 0.7,
	    hoverColor: false
	});

Custom Maps
======

The following is the converter instructions directly from [jVectorMap](https://github.com/bjornd/jvectormap) that could be used to create your own maps for JQVMap from the data in various GIS formats like Shapefile. The following command could be used to convert USA map from the data available at [www.naturalearthdata.com](www.naturalearthdata.com):

	python \
	  path/to/converter.py \
	  path/to/geo-data.shp \
	  path/to/resulting-map.js \
	  --width 900 \
	  --country_name_index 4 \
	  --where "ISO = 'USA'" \
	  --codes_file path/to/codes-en.tsv \
	  --insets '[{"codes": ["US-AK"], "width": 200, "left": 10, "top": 370}, {"codes": ["US-HI"], "width": 100, "left": 220, "top": 400}]' \
	  --minimal_area 4000000 \
	  --buffer_distance -3000 \
	  --simplify_tolerance 1000 \
	  --longtitude0 10w \
	  --name us
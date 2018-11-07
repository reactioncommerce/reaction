# Address Validation Test Plugin

## Purpose

The goal of this plugin is to serve as a guide for developers building custom plugins for address validation services and to provide developers building custom address validation UI a simple way to get mock validation results without needing a legitimate address validation service.

## Using this plugin to build address validation UI

First log in as a shop operator and enable the "Test" service in the Address Validation section of Shop settings. You can choose to limit to a specific country or not.

Once you have added "Test" to the list of enabled services for your shop, addresses will automatically start being validated when submitted (if using the default UI components).

- Enter a postal code that begins with `9` to test a valid address
- Enter a postal code that begins with any number other than `9` to get that number of random suggested addresses back (e.g, "10234" = 1 suggested address, "20234" = 2 suggested address, etc.)
- Enter a non-zero number for the second character of the postal code to get that many validation errors back, up to 5 (e.g., "11234" = 1 validation error, "12234" = 2 validation errors, etc.)

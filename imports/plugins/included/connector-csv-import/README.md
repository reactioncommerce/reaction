client

C1. In Import screen,  user chooses the Model (Product, Tag, etc.) to import.
C2. If user has existing mapping template for the selected model, user can download the mapping file.
C3. User proceeds with uploading a CSV file.
C4. User can click a checkbox to indicate if first row is a header or not. (Client should be able to figure this out if there is a mapping template for the model.)
C5. User will be asked to verify the field mapping (see flatfile.io mapping UI).

- If first row is not header, columns will be named as Column 1, Column 2, etc. User will be asked to map each column to a technical field.

C6. Once uploaded, Import Screen should show a list of pending and successful imports. The list should say if a file had errors. (More details on this later.)

Server

To allow C1, developer should be able to specify the models allowed to have imports for. Plugin will support imports for Products, Tags, Customers, Discounts, Taxes, Tax Codes, Shipping. Possibly a developer may write his own plugin to modify this list.

To allow C2, server should have an endpoint to output a CSV file that will be downloaded into client's browser with the mapped fields as the header. If there is no mapping template yet, header should contain the technical label for the fields.
There should be a function to 

In C5, client will ask if there is an existing template
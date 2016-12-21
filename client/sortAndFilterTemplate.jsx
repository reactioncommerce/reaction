import { Template } from 'meteor/templating';
import SortnFilter from '../imports/plugins/included/ui-search/client/templates/productSearch/SortnFilter.jsx';

Template.searchResults.helpers({
  SortnFilter() {
    return SortnFilter;
  }
});

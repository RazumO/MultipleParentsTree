//templates for mustache
window.app = {};
window.app.productsSelectOptions = '{{#data}}' +
    '<option value="{{index}}" {{#selected}} selected="true" {{/selected}}>' +
      '{{name}}' +
    '</option>' +
    '{{/data}}';
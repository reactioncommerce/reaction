import { html } from "/lib/core/templates";

// Standard HTML Email templste to be processed by Handlebars
const StandardTemplate = html`
<html>
  <body>
    "Great!!!" {{title}}
  </body>
</html>
`;

export default StandardTemplate;

-- O documento de customização passou do catálogo plano (`primaryColor`,
-- `headline`, ...) para o schema declarativo `{ version, draft, published,
-- publishedAt }`, que carrega template, tema e seções. O formato antigo não tem
-- equivalente no novo builder — as linhas gravadas nele voltam ao template
-- "blank", o mesmo estado que `CheckoutCustomization.default()` produz.
UPDATE "checkouts"
   SET "customization" = '{
     "version": 1,
     "draft": {
       "version": 1,
       "template": "blank",
       "theme": {
         "colors": {
           "primary": "#171717",
           "primaryText": "#ffffff",
           "background": "#fafafa",
           "surface": "#ffffff",
           "text": "#111111",
           "mutedText": "#737373",
           "border": "#e5e5e5"
         },
         "typography": { "fontFamily": "sans", "headingScale": "md", "bodyScale": "md" },
         "radii": { "base": 12, "button": 10, "input": 10 },
         "spacing": "default"
       },
       "sections": [
         { "id": "product", "type": "product", "enabled": true,
           "props": { "title": "", "description": "", "imageUrl": "", "badgeLabel": "", "showPrice": true } },
         { "id": "checkout-form", "type": "checkout-form", "enabled": true,
           "props": { "title": "Seus dados", "description": "Preencha para gerar o PIX.", "showOrderSummary": true } },
         { "id": "payment-cta", "type": "payment-cta", "enabled": true,
           "props": { "label": "Gerar PIX", "helperText": "", "showSecurityNote": true } },
         { "id": "footer", "type": "footer", "enabled": true,
           "props": { "text": "", "showSecureBadge": true, "links": [] } }
       ]
     },
     "published": null,
     "publishedAt": null
   }'::jsonb
 WHERE NOT ("customization" ? 'draft');

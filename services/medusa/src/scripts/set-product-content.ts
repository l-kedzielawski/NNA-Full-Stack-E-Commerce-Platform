import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function setProductContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    info: (msg: string) => void;
  };
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (input: Record<string, unknown>) => Promise<{ data?: Record<string, unknown>[] }>;
  };

  const targetHandle = "bourbon-vanilla-pods-gourmet-grade-madagascar-3-pods-in-glass-vial";

  const { data: products = [] } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: targetHandle },
  });

  if (!products.length) {
    throw new Error(`Product not found for handle: ${targetHandle}`);
  }

  const productId = String(products[0].id);

  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: productId,
          metadata: {
            custom_disable_origin_story: true,
            custom_youtube_embed_url: "https://www.youtube.com/embed/km6vAMYJ_3c",
            custom_storage:
              "The product should be stored in a tightly sealed container at room temperature (+12 C to +22 C), away from light, to preserve its quality. Avoid large and frequent temperature fluctuations. Store separately from other spices.",
            custom_shelf_life:
              "Shelf life: minimum 12 to 24 months. If stored for longer than 24 months, it is recommended to assess the product's quality before use.",
            custom_packaging:
              "Premium glass vial holding 3 vanilla pods, sealed tightly to preserve freshness, aroma, and natural oils. Made from high-quality, food-safe glass, compliant with international food safety standards. Custom vial sizes, closures, and private-label branding available upon request.",
            custom_botanical_name: "Vanilla planifolia",
            custom_type_label: "Grade A Gourmet",
            custom_faq_items: [
              {
                question: "What makes Bourbon vanilla pods from Madagascar special?",
                answer:
                  "Madagascar Bourbon vanilla is known for high vanillin, creamy sweetness, and complex aroma developed through traditional slow curing.",
              },
              {
                question: "How should I use the pods to get full flavor?",
                answer:
                  "Split the pod lengthwise, scrape the seeds, and use both seeds and pod shell. Infuse the shell in sugar, milk, or alcohol for deeper natural flavor.",
              },
              {
                question: "Are these suitable for professional pastry and food production?",
                answer:
                  "Yes. They are Grade A Gourmet pods with stable aroma profile, traceable origin, and predictable quality for bakery, pastry, dairy, and gastronomy use.",
              },
              {
                question: "How do you guarantee authenticity?",
                answer:
                  "Each batch is sourced from verified Madagascar production and includes documented origin to support traceability and quality control.",
              },
            ],
            custom_overview: [
              "Our Bourbon Gourmet Vanilla Pods from Madagascar are prized worldwide for exceptional quality and naturally rich aroma. Each pod measures at least 18 cm, with a soft, oily surface and dense fragrant seeds inside.",
              "Every batch is accompanied by a certificate confirming authentic Madagascan origin. Packaged in an elegant glass vial, this trio is ideal for gifting, home baking, and professional pastry use.",
            ],
            custom_gallery_images: [
              "/images/products/Laski_okladka_3szt_logo_bez-3-scaled.jpg",
              "/images/products/P1001296-1-scaled.jpg",
              "/images/products/P1001290-1-scaled.jpg",
              "/images/products/kat-laski-768x576-3.jpg",
            ],
            custom_detail_images: [
              "/images/products/Laski_okladka_3szt_logo_bez-3-scaled.jpg",
              "/images/products/kat-laski-768x576-3.jpg",
            ],
            custom_spec_rows: [
              { label: "Length", value: ">= 18 cm" },
              { label: "Color", value: "Deep black" },
              { label: "Grade", value: "Gourmet / Pure Premium" },
              {
                label: "Aroma Profile",
                value:
                  "Creamy, sweet, and full-bodied with dominant vanillin; layered notes of caramel, honey, and butter; subtle woody and balsamic undertones with delicate floral accents.",
              },
              { label: "Minimum Vanillin Content", value: "1.8% - 2.4%" },
              { label: "Moisture Content", value: "30% - 35%" },
              { label: "Aflatoxins", value: "Not detected" },
              { label: "Botanical Name", value: "Vanilla planifolia" },
              { label: "Production Type", value: "Conventional" },
              { label: "Origin", value: "Madagascar" },
              { label: "Packaging", value: "3 pods in hermetically sealed glass tube vial" },
              { label: "Shelf Life", value: "Minimum 12 months" },
            ],
            custom_detail_sections: [
              {
                title: "From Madagascar",
                paragraphs: [
                  "Bourbon vanilla is the global reference for real vanilla. Madagascar and nearby islands supply around 80% of the world's market value, making this region the center of premium quality.",
                  "What sets it apart is not only location, but strict traditional curing that locks in high vanillin and a stable full-bodied aroma. Bourbon beans consistently show higher vanillin and greater aromatic complexity, with over 240 identified volatile compounds.",
                ],
              },
              {
                title: "Aroma Profile Bourbon Pods",
                paragraphs: [
                  "Bourbon vanilla beans release a rich creamy-sweet aroma dominated by vanillin, with notes of caramel, honey, and butter. Beneath that, you get subtle woody and floral undertones. The finish is warm, smooth, and long-lasting with zero chemical notes.",
                  "To use them fully, split the pod and scrape out the seeds. Add the remaining pod to sugar, milk, or alcohol to create a natural infusion with one-of-a-kind flavor.",
                ],
                bullets: [
                  "Baking and desserts: cheesecakes, tarts, creams, cupcakes",
                  "Ice cream and chocolate: adds genuine premium taste",
                  "Drinks and alcohols: coffee, hot chocolate, tinctures, liqueurs",
                  "Professional pastry and gastronomy: where aroma and presentation matter",
                ],
              },
              {
                title: "Why Ours Stand Out",
                bullets: [
                  "Hand-picked and sun-dried to preserve full aroma and essential oils",
                  "Gourmet Grade A, among the thickest and most aromatic pods from Madagascar",
                  "Consistent aroma profile for reliable results in every recipe",
                  "Certificate of origin as proof of authenticity and premium quality",
                ],
                paragraphs: [
                  "Only true traditionally cured Bourbon vanilla reaches your production line: fully documented, traceable, lab-verified, and compliant with strict regulations.",
                ],
              },
              {
                title: "Market Challenges",
                paragraphs: [
                  "Not all Bourbon vanilla pods are equal. Some are harvested and processed too quickly, so they look good at first but never develop full aroma and vanillin content.",
                  "Without documented traceability, batches can swing in quality. Poor storage and long transport without humidity and temperature control can flatten aroma, shorten shelf life, and reduce consistency.",
                  "We do things differently: verified Madagascar production, slow traditional curing, full documentation, and stable quality you can trust in every batch.",
                ],
              },
            ],
          },
        },
      ],
    },
  });

  logger.info(`Updated product metadata for ${targetHandle}`);
}

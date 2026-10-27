export interface PolicySection {
  id: string;
  title: string;
  content: string;
}

export interface PolicyPageData {
  id: string;
  title: string;
  introText: string;
  introItalic: boolean;
  sections: PolicySection[];
  footerNote: string;
  footerItalic: boolean;
  updatedAt?: string | Date;
}

export const DEFAULT_SHIPPING_AND_DELIVERY: PolicyPageData = {
  id: "shipping-and-delivery",
  title: "Shipping & Delivery",
  introText:
    "Most Pause Palette pieces are thoughtfully made to order, helping us create with greater intention while reducing unnecessary production and fabric waste.",
  introItalic: true,
  sections: [
    {
      id: "dispatch",
      title: "DISPATCH",
      content:
        "Orders are typically dispatched within 12–15 business days from confirmation. Customised pieces or material related delays may require a little additional time, and we will keep you informed where needed.",
    },
    {
      id: "complimentary-shipping",
      title: "COMPLIMENTARY SHIPPING",
      content:
        "We offer complimentary shipping across India. Tracking details will be shared once your order has been dispatched.",
    },
    {
      id: "delivery",
      title: "DELIVERY",
      content:
        "Delivery timelines begin from the date of dispatch and may vary depending on your location and courier service. Please ensure your delivery details are complete and accurate to avoid delays.",
    },
  ],
  footerNote:
    "Pieces made with intention are worth a little time. Thank you for allowing us the time to make yours thoughtfully",
  footerItalic: true,
};

export const DEFAULT_RETURNS_AND_EXCHANGES: PolicyPageData = {
  id: "returns-and-exchanges",
  title: "Returns & Exchanges",
  introText:
    "At Pause Palette, every piece is thoughtfully made to order. We take great care in crafting and checking every garment before it reaches you. To ensure your chosen piece is exactly as expected, it's checked to perfectly match that which was ordered.\n\nWe understand, however, that sometimes an exchange may need to take place. Eligible returns are reviewed individually by our team.",
  introItalic: false,
  sections: [
    {
      id: "returns",
      title: "RETURNS",
      content:
        "Returns are accepted only if a product arrives damaged, defective, or different from the item confirmed in your order.\n\nPlease contact us within 48 hours of delivery. An unboxing video clearly showing the sealed package and the issue is required for verification.\n\nThe item must remain unworn, unwashed and unused, with all original tags, labels, invoices and packaging intact.\n\nOnce approved, the item must be dispatched back to us within 7 days.\n\nWe do not offer cash refunds. Depending on the nature of the issue, an appropriate replacement item or a store credit will be offered.",
    },
    {
      id: "exchanges",
      title: "EXCHANGES",
      content:
        "We are happy to assist with a size exchange, subject to availability. Requests must be made within 48 hours of delivery, and the piece must remain unworn, unwashed and unused, with all original tags and packaging intact.\n\nAs Pause Palette is made to order, your replacement size may need to be crafted especially for you. In such cases, return times are approximately 14-21 business days for a new piece. In all instances it is subject to fabric and material availability.\n\nReturn and re-delivery shipping charges for size exchanges are borne by the customer.",
    },
    {
      id: "delivery-transit",
      title: "DELIVERY & TRANSIT",
      content:
        "Please ensure that your shipping information is correct and complete when placing your order. We are unable to offer a refund, replacement or exchange for errors affected by your contact or incomplete address. Once dispatched, tracking updates are emailed to the recipient by the courier.\n\nWe are not responsible for tracking the package for stolen, damaged or missing items during shipment. If your package arrives unsealed, please record the immediate opening of the unsealed packaging and contact us immediately.",
    },
    {
      id: "note",
      title: "NOTE",
      content:
        "As many Pause Palette pieces are crafted from natural fabrics, subtle variations in weave, texture and colour are part of their inherent character and are not considered defects.\n\nAll returns and exchange requests are reviewed individually. Pause Palette reserves the right to decline or approve request at its sole discretion based on the circumstances of each request.\n\nFor assistance, please contact our team at pausepalette@gmail.com",
    },
  ],
  footerNote: "",
  footerItalic: false,
};

export const POLICY_PAGE_DEFAULTS: Record<string, PolicyPageData> = {
  "shipping-and-delivery": DEFAULT_SHIPPING_AND_DELIVERY,
  "returns-and-exchanges": DEFAULT_RETURNS_AND_EXCHANGES,
};

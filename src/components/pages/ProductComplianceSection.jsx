import { CheckCircle, Globe, FileText, Shield } from "lucide-react";

export default function ProductComplianceSection({ product }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="text-3xl font-extrabold mb-12">
        Export Compliance & Specifications
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Specifications */}
        <div className="rounded-2xl p-8 bg-white shadow-xl">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <FileText className="text-[#d7b15b]" />
            Product Specifications
          </h3>

          <Spec label="Product Name" value={product.title} />
          <Spec label="MOQ" value={`${product.moq || 1} Units`} />
          <Spec label="Trade Type" value={product.trade_type} />
          <Spec label="Packaging" value="Bulk / Custom Export Packaging" />
          <Spec label="Shelf Life" value="As per product standards" />
        </div>

        {/* Compliance */}
        <div className="rounded-2xl p-8 bg-white shadow-xl">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Shield className="text-[#d7b15b]" />
            Export Compliance
          </h3>

          <Compliance text="ISO & HACCP Certified Manufacturing" />
          <Compliance text="International Food Safety Standards" />
          <Compliance text="Export Documentation Support" />
          <Compliance text="Country-Specific Compliance Available" />
          <Compliance text="Global Logistics & Shipping Assistance" />
        </div>
      </div>
    </section>
  );
}

function Spec({ label, value }) {
  return (
    <div className="flex justify-between border-b py-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Compliance({ text }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <CheckCircle className="text-green-600 mt-0.5" />
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

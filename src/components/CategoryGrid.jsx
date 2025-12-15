import React, { useEffect, useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform
} from "framer-motion";
import { getCategories, getProducts, toAbsoluteImageUrl } from "@/lib/api";
import { Link } from "react-router-dom";

/* =====================================================
   DATA HELPERS
===================================================== */

function buildCategoryData(products = []) {
  const map = {};
  const sorted = [...products].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  for (const p of sorted) {
    const cid = p.category?.id;
    if (!cid) continue;

    if (!map[cid]) {
      map[cid] = {
        heroProduct: p,
        thumbnail: p.primary_image
          ? toAbsoluteImageUrl(p.primary_image)
          : null,
        products: []
      };
    }

    if (map[cid].products.length < 3) {
      map[cid].products.push(p);
    }
  }

  return map;
}

/* =====================================================
   3D CATEGORY CARD
===================================================== */

function CategoryCard3D({ category, data }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(useTransform(my, [-50, 50], [16, -16]), {
    stiffness: 160,
    damping: 18
  });

  const rotateY = useSpring(useTransform(mx, [-50, 50], [-16, 16]), {
    stiffness: 160,
    damping: 18
  });

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  }

  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      layout
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="mb-10 break-inside-avoid"
    >
      <Link to={`/products/category/${category.slug}`}>
        <div
          className="
            relative rounded-[28px] overflow-hidden
            bg-[#0b1f1e]
            shadow-[0_40px_120px_rgba(0,0,0,0.55)]
          "
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* HERO IMAGE (shared-element ready) */}
          <div className="relative h-[300px] overflow-hidden">
            {data?.heroProduct ? (
              <motion.img
                layoutId={`product-hero-${data.heroProduct.id}`}
                src={data.thumbnail}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover scale-110"
                style={{ transform: "translateZ(40px)" }}
              />
            ) : (
              <img
                src="/img/category-placeholder.jpg"
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover scale-110"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          {/* CONTENT */}
          <div
            className="relative p-6"
            style={{ transform: "translateZ(60px)" }}
          >
            <h3 className="text-2xl font-bold text-white">
              {category.name}
            </h3>

            <span className="
              inline-block mt-2 text-xs font-semibold uppercase
              px-3 py-1 rounded-full bg-[#d7b15b] text-black
            ">
              {category.trade_type}
            </span>
          </div>

          {/* HOVER PRODUCT PREVIEW */}
          <div className="
            absolute inset-x-0 bottom-0
            translate-y-full hover:translate-y-0
            transition-transform duration-500
            bg-black/85 backdrop-blur-xl p-4
          ">
            <p className="text-xs text-[#d7b15b] mb-2 tracking-wide">
              FEATURED PRODUCTS
            </p>

            <div className="flex gap-3">
              {data?.products?.map(p => (
                <img
                  key={p.id}
                  src={toAbsoluteImageUrl(p.primary_image)}
                  alt={p.title}
                  className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/20"
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* =====================================================
   MAIN GRID
===================================================== */

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tradeType, setTradeType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCategories({ limit: 100 }),
      getProducts({ limit: 300 })
    ]).then(([c, p]) => {
      setCategories(c.categories || []);
      setProducts(p.products || []);
      setLoading(false);
    });
  }, []);

  const dataMap = useMemo(
    () => buildCategoryData(products),
    [products]
  );

  const filtered = useMemo(() => {
    if (tradeType === "all") return categories;
    return categories.filter(c => c.trade_type === tradeType);
  }, [categories, tradeType]);

  if (loading) {
    return (
      <div className="py-40 text-center text-gray-400">
        Loading categories…
      </div>
    );
  }

  return (
    <section className="px-6 py-28 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold">
          <span className="text-[#164946]">Explore</span>{" "}
          <span className="text-[#d7b15b]">Categories</span>
        </h2>

        <select
          value={tradeType}
          onChange={e => setTradeType(e.target.value)}
          className="
            px-5 py-2 rounded-xl bg-black text-white
            border border-white/20 shadow-xl
          "
        >
          <option value="all">All Trade Types</option>
          <option value="export">Export</option>
          <option value="import">Import</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* GRID */}
      <motion.div
        layout
        className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-10"
      >
        <AnimatePresence>
          {filtered.map(cat => (
            <CategoryCard3D
              key={cat.id}
              category={cat}
              data={dataMap[cat.id]}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
